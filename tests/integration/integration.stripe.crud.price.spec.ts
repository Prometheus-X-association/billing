import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import StripePriceCrudService from '../../src/services/StripePriceCrudService';
import { getApp } from '../../src/app';
import StripeConnectedAccountService from '../../src/services/StripeConnectedAccountService';
import StripeProductCrudService from '../../src/services/StripeProductCrudService';
import { Logger } from '../../src/libs/Logger';

const stripePriceService = StripePriceCrudService.retrieveServiceInstance();

let server: http.Server;

const productId1 = 'prod_test_1';
let testPrice1: string | undefined;
let testProduct1: string | undefined;

const stripeConnectedAccountService =
  StripeConnectedAccountService.retrieveServiceInstance();

const stripeProductService =
  StripeProductCrudService.retrieveServiceInstance();
let testConnectedAccountId: string | undefined;

const ensureProductExists = async (productId: string) => {
  try {
    const product = await stripePriceService
      .getStripe()
      ?.products.retrieve(productId);
    return product?.id;
  } catch (error: any) {
    if (error.raw?.type === 'invalid_request_error') {
      const product = await stripePriceService.getStripe()?.products.create({
        id: productId,
        name: `Test Product for ${productId}`,
      });
      return product?.id;
    }
    throw error;
  }
};

const ensurePriceExists = async (productId: string) => {
  const price = await stripePriceService.getStripe()?.prices.create({
    unit_amount: 1,
    currency: 'usd',
    recurring: { interval: 'month' },
    product: productId,
  });
  return price?.id;
};

describe('Stripe Price CRUD API', function () {
  before(async function () {
    await ensureProductExists(productId1);
    testPrice1 = await ensurePriceExists(productId1);
    const app = await getApp();
    await new Promise((resolve) => {
      const { port } = config;
      server = app.listen(port, () => {
        Logger.info({
          message: `Test server is running on port ${port}`,
        });
        resolve(true);
      });
    });

     // Create a connected account
     const connectedAccount = await stripeConnectedAccountService.createConnectedAccount({
      type: 'standard',
      country: 'US',
      email: 'test_connected_account@example.com',
    });
    testConnectedAccountId = connectedAccount?.id;

    const product = await stripeProductService.createProduct(
      {
        name: 'New Test Product',
        description: 'A test product',
      },
      {stripeAccount: testConnectedAccountId as string},
    );
    testProduct1 = product?.id;
  });

  after(async () => {
    if (server) {
      if (testConnectedAccountId) {
        await stripeConnectedAccountService.deleteConnectedAccount(testConnectedAccountId);
      }
      server.close(() => {
        Logger.info({
          message: 'Test server closed',
        });
      });
    }
  });

  it('should create a new price', async () => {
    const response = await supertest(server)
      .post('/api/stripe/prices')
      .set('stripe-account', testConnectedAccountId as string)
      .send({
        unit_amount: 2,
        currency: 'usd',
        recurring: { interval: 'month' },
        product: testProduct1,
      });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    testPrice1 = response.body.id;
  });

  it('should retrieve all prices', async () => {
    const response = await supertest(server)
      .get('/api/stripe/prices')
    .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const price = response.body.find((p: any) => p.id === testPrice1);
    expect(price).to.exist;
  });

  it('should retrieve a price by ID', async () => {
    const response = await supertest(server)
    .get(
      `/api/stripe/prices/${testPrice1}`,
    ).set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPrice1);
  });

  it('should update an existing price', async () => {
    const response = await supertest(server)
      .put(`/api/stripe/prices/${testPrice1}`)
      .set('stripe-account', testConnectedAccountId as string)
      .send({
        metadata: { key: 'value' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPrice1);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should deactivate a price', async () => {
    const response = await supertest(server).delete(
      `/api/stripe/prices/${testPrice1}`,
    ).set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Price deactivated successfully.',
    );
  });

  it('should return 404 for non-existent price', async () => {
    const response = await supertest(server).get(
      '/api/stripe/prices/non_existent_id',
    ).set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Price not found.');
  });
});
