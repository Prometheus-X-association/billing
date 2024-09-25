import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import { getApp } from '../../src/app';
import { _logYellow } from '../utils/utils';
import sinon from 'sinon';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionSyncService';

let server: http.Server;
let testPaymentIntentId: string;
const testStripeAccountId: string = 'acct_50726F6D6574686575732058';
const fakePaymentMethodId = 'pm_50726F6D6574686575732058';

describe('Stripe Payment Intent API', function () {
  const title = this.title;
  let stripeStub: Stripe;

  before(async function () {
    _logYellow(`- ${title} running...`);

    const app = await getApp();
    await new Promise((resolve) => {
      const { port } = config;
      server = app.listen(port, () => {
        console.log(`Test server is running on port ${port}`);
        resolve(true);
      });
    });

    stripeStub = {
      paymentIntents: {
        create: sinon.stub(),
        retrieve: sinon.stub(),
        update: sinon.stub(),
        confirm: sinon.stub(),
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

  it('should create a new payment intent', async () => {
    const fakePaymentIntent: Partial<Stripe.PaymentIntent> = {
      id: fakePaymentMethodId,
      amount: 2,
      currency: 'usd',
    };
    (stripeStub.paymentIntents.create as sinon.SinonStub).resolves(
      fakePaymentIntent as Stripe.PaymentIntent,
    );

    const response = await supertest(server)
      .post('/api/stripe/payment_intents')
      .set('Stripe-Account', testStripeAccountId)
      .send({
        amount: 2,
        currency: 'usd',
        payment_method_types: ['card'],
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id', fakePaymentIntent.id);
    expect(response.body).to.have.property('amount', 2);
    expect(response.body).to.have.property('currency', 'usd');
    testPaymentIntentId = response.body.id;
  });

  it('should retrieve an existing payment intent', async () => {
    const fakePaymentIntent: Partial<Stripe.PaymentIntent> = {
      id: testPaymentIntentId,
      amount: 2,
      currency: 'usd',
    };
    (stripeStub.paymentIntents.retrieve as sinon.SinonStub).resolves(
      fakePaymentIntent as Stripe.PaymentIntent,
    );

    const response = await supertest(server)
      .get(`/api/stripe/payment_intents/${testPaymentIntentId}`)
      .set('Stripe-Account', testStripeAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPaymentIntentId);
    expect(response.body).to.have.property('amount', 2);
    expect(response.body).to.have.property('currency', 'usd');
  });

  it('should update an existing payment intent', async () => {
    const fakeUpdatedPaymentIntent: Partial<Stripe.PaymentIntent> = {
      id: testPaymentIntentId,
      amount: 3,
      currency: 'usd',
    };
    (stripeStub.paymentIntents.update as sinon.SinonStub).resolves(
      fakeUpdatedPaymentIntent as Stripe.PaymentIntent,
    );

    const response = await supertest(server)
      .post(`/api/stripe/payment_intents/${testPaymentIntentId}`)
      .set('Stripe-Account', testStripeAccountId)
      .send({
        amount: 3,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPaymentIntentId);
    expect(response.body).to.have.property('amount', 3);
  });

  it('should confirm a payment intent', async () => {
    const fakeConfirmedPaymentIntent: Partial<Stripe.PaymentIntent> = {
      id: testPaymentIntentId,
      status: 'succeeded',
    };
    (stripeStub.paymentIntents.confirm as sinon.SinonStub).resolves(
      fakeConfirmedPaymentIntent as Stripe.PaymentIntent,
    );

    const response = await supertest(server)
      .post(`/api/stripe/payment_intents/${testPaymentIntentId}/confirm`)
      .set('Stripe-Account', testStripeAccountId)
      .send({
        payment_method: fakePaymentMethodId,
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPaymentIntentId);
    expect(response.body).to.have.property('status', 'succeeded');
  });

  it('should return a 404 for a non-existent payment intent', async () => {
    (stripeStub.paymentIntents.retrieve as sinon.SinonStub).rejects(
      new Error('Payment intent not found'),
    );

    const response = await supertest(server)
      .get('/api/stripe/payment_intents/non_existent_id')
      .set('Stripe-Account', testStripeAccountId);

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property(
      'message',
      'Payment intent not found.',
    );
  });
});
