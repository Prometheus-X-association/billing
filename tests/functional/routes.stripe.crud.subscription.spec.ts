import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import { config } from '../../src/config/environment';
import http from 'http';
import { getApp } from '../../src/app';
import { Logger } from '../../src/libs/Logger';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionSyncService';

let server: http.Server;
let stripeStub: Stripe;
let testConnectedAccountId: string = 'acct_123456789';
let testCustomerId: string = 'cus_123456789';
let testPriceId: string = 'price_123456789';
let testSubscriptionId: string;

describe('Stripe Subscription CRUD API', function () {
  before(async function () {
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

    // Set up Stripe stub
    stripeStub = {
      subscriptions: {
        create: sinon.stub(),
        retrieve: sinon.stub(),
        update: sinon.stub(),
        cancel: sinon.stub(),
        list: sinon.stub(),
      },
    } as unknown as Stripe;

    const stripeServiceStub = sinon.createStubInstance(StripeService);
    stripeServiceStub.getStripe.returns(stripeStub);
    sinon
      .stub(StripeService, 'retrieveServiceInstance')
      .returns(stripeServiceStub as any);
  });

  after(async () => {
    if (server) {
      server.close(() => {
        Logger.info({
          message: 'Test server closed',
        });
      });
    }
    sinon.restore();
  });

  it('should create a new subscription for a customer', async () => {
    const fakeSubscription = {
      id: 'sub_123456789',
      customer: testCustomerId,
      items: {
        data: [{ price: testPriceId }],
      },
      metadata: {
        participant: 'http://catalog.api/catalog/participant/participant1',
        offer: 'http://catalog.api/catalog/offers/offer1'
      },
    };
    (stripeStub.subscriptions.create as sinon.SinonStub).resolves(fakeSubscription);

    const response = await supertest(server)
      .post('/api/stripe/subscriptions')
      .set('stripe-account', testConnectedAccountId)
      .send({
        customerId: testCustomerId,
        priceId: testPriceId,
        metadata: {
          participant: 'http://catalog.api/catalog/participant/participant1',
          offer: 'http://catalog.api/catalog/offers/offer1'
        }
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('customer', testCustomerId);
    testSubscriptionId = response.body.id;
  });

  it('should retrieve an existing subscription by ID', async () => {
    const fakeSubscription = {
      id: testSubscriptionId,
      customer: testCustomerId,
      items: {
        data: [{ price: testPriceId }],
      },
    };
    (stripeStub.subscriptions.retrieve as sinon.SinonStub).resolves(fakeSubscription);

    const response = await supertest(server)
      .get(`/api/stripe/subscriptions/${testSubscriptionId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testSubscriptionId);
    expect(response.body).to.have.property('customer', testCustomerId);
  });

  it('should update an existing subscription', async () => {
    const fakeUpdatedSubscription = {
      id: testSubscriptionId,
      customer: testCustomerId,
      items: {
        data: [{ price: testPriceId }],
      },
      metadata: { 
        key: 'value',
        participant: 'http://catalog.api/catalog/participant/participant1',
        offer: 'http://catalog.api/catalog/offers/offer1'
      },
    };
    (stripeStub.subscriptions.update as sinon.SinonStub).resolves(fakeUpdatedSubscription);

    const response = await supertest(server)
      .put(`/api/stripe/subscriptions/${testSubscriptionId}`)
      .set('stripe-account', testConnectedAccountId)
      .send({
        metadata: { key: 'value' },
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testSubscriptionId);
    expect(response.body).to.have.property('metadata').eql({
      key: 'value',
      participant: 'http://catalog.api/catalog/participant/participant1',
      offer: 'http://catalog.api/catalog/offers/offer1'
    });
  });

  it('should get all subscriptions', async () => {
    const fakeSubscriptionsList = {
      data: [
        {
          id: testSubscriptionId,
          customer: testCustomerId,
          items: {
            data: [{ price: testPriceId }],
          },
        },
      ],
      has_more: false,
    };
    (stripeStub.subscriptions.list as sinon.SinonStub).resolves(fakeSubscriptionsList);

    const response = await supertest(server)
      .get('/api/stripe/subscriptions')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const subscription = response.body.find((sub: any) => sub.id === testSubscriptionId);
    expect(subscription).to.exist;
    expect(subscription.customer).to.equal(testCustomerId);
  });

  it('should cancel an existing subscription', async () => {
    const fakeCanceledSubscription = {
      id: testSubscriptionId,
      status: 'canceled',
    };
    (stripeStub.subscriptions.cancel as sinon.SinonStub).resolves(fakeCanceledSubscription);

    const response = await supertest(server)
      .delete(`/api/stripe/subscriptions/${testSubscriptionId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Subscription canceled successfully.',
    );
  });

  it('should return a 404 for a non-existent subscription', async () => {
    (stripeStub.subscriptions.retrieve as sinon.SinonStub).rejects(new Error('Subscription not found'));

    const response = await supertest(server)
      .get('/api/stripe/subscriptions/non_existent_id')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property(
      'message',
      'Subscription not found.',
    );
  });
});
