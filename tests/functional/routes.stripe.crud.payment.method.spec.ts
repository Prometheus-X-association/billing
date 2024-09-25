import supertest from 'supertest';
import { expect } from 'chai';
import http from 'http';
import { getApp } from '../../src/app';
import sinon from 'sinon';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionSyncService';

let server: http.Server;
const testStripeAccountId: string = 'acct_50726F6D6574686575732058';
const fakePaymentMethodId = 'pm_50726F6D6574686575732058';

describe('Stripe Payment Method API', function () {
  let stripeStub: Stripe;

  before(async function () {
    const app = await getApp();
    await new Promise((resolve) => {
      server = app.listen(3000, () => {
        console.log(`Test server is running on port 3000`);
        resolve(true);
      });
    });

    stripeStub = {
      paymentMethods: {
        create: sinon.stub(),
        retrieve: sinon.stub(),
        attach: sinon.stub(),
        detach: sinon.stub(),
      },
    } as unknown as Stripe;

    const stripeServiceStub = sinon.createStubInstance(StripeService);
    stripeServiceStub.getStripe.returns(stripeStub);
    sinon
      .stub(StripeService, 'retrieveServiceInstance')
      .returns(stripeServiceStub as any);
  });

  after(() => {
    server.close();
    sinon.restore();
  });

  it('should create a new payment method', async () => {
    const fakePaymentMethod: Partial<Stripe.PaymentMethod> = {
      id: fakePaymentMethodId,
    };
    (stripeStub.paymentMethods.create as sinon.SinonStub).resolves(
      fakePaymentMethod as Stripe.PaymentMethod,
    );

    const response = await supertest(server)
      .post('/api/stripe/payment_methods')
      .send({ type: 'card' })
      .set('stripe-account', testStripeAccountId)
      .expect(201);

    expect(response.body.id).to.equal(fakePaymentMethodId);
  });

  it('should attach a payment method to a customer', async () => {
    const fakeCustomer = 'cus_123456';
    const fakeAttachedPaymentMethod: Partial<Stripe.PaymentMethod> = {
      id: fakePaymentMethodId,
      customer: fakeCustomer,
    };

    (stripeStub.paymentMethods.attach as sinon.SinonStub).resolves(
      fakeAttachedPaymentMethod as Stripe.PaymentMethod,
    );

    const response = await supertest(server)
      .post(`/api/stripe/payment_methods/${fakePaymentMethodId}/attach`)
      .send({ customer: fakeCustomer })
      .set('stripe-account', testStripeAccountId)
      .expect(200);

    expect(response.body.id).to.equal(fakePaymentMethodId);
    expect(response.body.customer).to.equal(fakeCustomer);
  });

  it('should retrieve a payment method', async () => {
    const fakePaymentMethod: Partial<Stripe.PaymentMethod> = {
      id: fakePaymentMethodId,
    };

    (stripeStub.paymentMethods.retrieve as sinon.SinonStub).resolves(
      fakePaymentMethod as Stripe.PaymentMethod,
    );

    const response = await supertest(server)
      .get(`/api/stripe/payment_methods/${fakePaymentMethodId}`)
      .set('stripe-account', testStripeAccountId)
      .expect(200);

    expect(response.body.id).to.equal(fakePaymentMethodId);
  });

  it('should detach a payment method', async () => {
    const fakeDetachedPaymentMethod: Partial<Stripe.PaymentMethod> = {
      id: fakePaymentMethodId,
      customer: null,
    };

    (stripeStub.paymentMethods.detach as sinon.SinonStub).resolves(
      fakeDetachedPaymentMethod as Stripe.PaymentMethod,
    );

    const response = await supertest(server)
      .post(`/api/stripe/payment_methods/${fakePaymentMethodId}/detach`)
      .set('stripe-account', testStripeAccountId)
      .expect(200);

    expect(response.body.id).to.equal(fakePaymentMethodId);
    expect(response.body.customer).to.be.null;
  });
});
