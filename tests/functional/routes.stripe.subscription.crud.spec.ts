import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import StripeSubscriptionCrudService from '../../src/services/StripeSubscriptionCrudService';
import { getApp } from '../../src/app';
import { _logYellow } from '../utils/utils';

const stripeSubscriptionService =
  StripeSubscriptionCrudService.retrieveServiceInstance();

let server: http.Server;

let testCustomer1: string;
let testPrice1: string | undefined;
let paymentMethod1: string | undefined;

const productId1 = 'prod_test_1';

const ensureCustomerExists = async (email: string, name: string) => {
  const existingCustomers = await stripeSubscriptionService
    .getStripe()
    ?.customers.list({ email });

  if (existingCustomers && existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }
  const newCustomer = await stripeSubscriptionService
    .getStripe()
    ?.customers.create({ email, name });
  return newCustomer?.id;
};

const ensurePaymentMethodExists = async (customerId: string) => {
  const paymentMethods = await stripeSubscriptionService
    .getStripe()
    ?.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

  if (paymentMethods?.data.length) {
    return paymentMethods.data[0].id;
  }
  const newPaymentMethod = await stripeSubscriptionService
    .getStripe()
    ?.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa',
      },
    });

  await stripeSubscriptionService
    .getStripe()
    ?.paymentMethods.attach(newPaymentMethod?.id as string, {
      customer: customerId,
    });
  await stripeSubscriptionService.getStripe()?.customers.update(customerId, {
    invoice_settings: { default_payment_method: newPaymentMethod?.id },
  });
  return newPaymentMethod?.id;
};

const ensureProductExists = async (productId: string) => {
  try {
    const product = await stripeSubscriptionService
      .getStripe()
      ?.products.retrieve(productId);
    return product?.id;
  } catch (error: any) {
    if (error.raw?.type === 'invalid_request_error') {
      const product = await stripeSubscriptionService
        .getStripe()
        ?.products.create({
          id: productId,
          name: `Test Product for ${productId}`,
        });
      return product?.id;
    }
    throw error;
  }
};

const ensurePriceExists = async (priceId: string, productId: string) => {
  try {
    const price = await stripeSubscriptionService
      .getStripe()
      ?.prices.retrieve(priceId);
    return price?.id;
  } catch (error: any) {
    if (error.raw?.type === 'invalid_request_error') {
      const price = await stripeSubscriptionService.getStripe()?.prices.create({
        unit_amount: 1000,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        product: productId,
      });
      return price?.id;
    }
    throw error;
  }
};

describe('Stripe Subscription CRUD API', function () {
  const title = this.title;
  before(async function () {
    _logYellow(`- ${title} running...`);

    this.timeout(8000);
    testCustomer1 = (await ensureCustomerExists(
      'test_customer_1@example.com',
      'Test Customer 1',
    )) as string;

    paymentMethod1 = await ensurePaymentMethodExists(testCustomer1);
    await ensureProductExists(productId1);
    testPrice1 = await ensurePriceExists('price_test_1', productId1);
    const app = await getApp();
    await new Promise((resolve) => {
      const { port } = config;
      server = app.listen(port, () => {
        console.log(`Test server is running on port ${port}`);
        resolve(true);
      });
    });
  });

  after(async () => {
    try {
      const subscriptions = await stripeSubscriptionService.listSubscriptions();
      if (subscriptions) {
        for (const subscription of subscriptions) {
          if (subscription.customer === testCustomer1) {
            await stripeSubscriptionService.cancelSubscription(subscription.id);
          }
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error(`Error during after hook: ${err.message}`);
    } finally {
      server.close();
    }
  });

  let testSubscriptionId: string;

  it('should create a new subscription for a customer', async () => {
    const response = await supertest(server)
      .post('/api/stripe/subscriptions')
      .send({
        customerId: testCustomer1,
        priceId: testPrice1,
      });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('customer');
    expect(response.body.customer).to.equal(testCustomer1);
    testSubscriptionId = response.body.id;
  });

  it('should retrieve an existing subscription by ID', async () => {
    const response = await supertest(server).get(
      `/api/stripe/subscriptions/${testSubscriptionId}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testSubscriptionId);
    expect(response.body).to.have.property('customer');
    expect(response.body.customer).to.equal(testCustomer1);
  });

  it('should update an existing subscription', async () => {
    const response = await supertest(server)
      .put(`/api/stripe/subscriptions/${testSubscriptionId}`)
      .send({
        metadata: { key: 'value' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testSubscriptionId);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should get all subscriptions', async () => {
    const response = await supertest(server).get('/api/stripe/subscriptions');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const subscription = response.body.find(
      (sub: any) => sub.id === testSubscriptionId,
    );
    expect(subscription).to.exist;
    expect(subscription.customer).to.equal(testCustomer1);
  });

  it('should cancel an existing subscription', async () => {
    const response = await supertest(server).delete(
      `/api/stripe/subscriptions/${testSubscriptionId}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Subscription canceled successfully.',
    );
  });

  it('should return a 404 for a non-existent subscription', async () => {
    const response = await supertest(server).get(
      '/api/stripe/subscriptions/non_existent_id',
    );
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property(
      'message',
      'Subscription not found.',
    );
  });
});
