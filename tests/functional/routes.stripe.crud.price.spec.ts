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
let testConnectedAccountId: string = 'acct_123456789';
let testProductId: string = 'prod_123456789';
let testPriceId: string;
let stripeStub: Stripe;

describe('Stripe Price CRUD API', function () {
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
      prices: {
        create: sinon.stub(),
        retrieve: sinon.stub(),
        update: sinon.stub(),
        list: sinon.stub(),
      },
      products: {
        retrieve: sinon.stub(),
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

  it('should create a new price', async () => {
    const fakePrice = {
      id: 'price_123456789',
      unit_amount: 2,
      currency: 'usd',
      recurring: { interval: 'month' },
      product: testProductId,
    };
    (stripeStub.prices.create as sinon.SinonStub).resolves(fakePrice);

    const response = await supertest(server)
      .post('/api/stripe/prices')
      .set('stripe-account', testConnectedAccountId)
      .send({
        unit_amount: 2,
        currency: 'usd',
        recurring: { interval: 'month' },
        product: testProductId,
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    testPriceId = response.body.id;
  });

  it('should retrieve all prices', async () => {
    const fakePricesList = {
      data: [
        {
          id: testPriceId,
          unit_amount: 2,
          currency: 'usd',
          recurring: { interval: 'month' },
          product: testProductId,
        },
      ],
      has_more: false,
    };
    (stripeStub.prices.list as sinon.SinonStub).resolves(fakePricesList);

    const response = await supertest(server)
      .get('/api/stripe/prices')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const price = response.body.find((p: any) => p.id === testPriceId);
    expect(price).to.exist;
  });

  it('should retrieve a price by ID', async () => {
    const fakePrice = {
      id: testPriceId,
      unit_amount: 2,
      currency: 'usd',
      recurring: { interval: 'month' },
      product: testProductId,
    };
    (stripeStub.prices.retrieve as sinon.SinonStub).resolves(fakePrice);

    const response = await supertest(server)
      .get(`/api/stripe/prices/${testPriceId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPriceId);
  });

  it('should update an existing price', async () => {
    const fakeUpdatedPrice = {
      id: testPriceId,
      unit_amount: 2,
      currency: 'usd',
      recurring: { interval: 'month' },
      product: testProductId,
      metadata: { key: 'value' },
    };
    (stripeStub.prices.update as sinon.SinonStub).resolves(fakeUpdatedPrice);

    const response = await supertest(server)
      .put(`/api/stripe/prices/${testPriceId}`)
      .set('stripe-account', testConnectedAccountId)
      .send({
        metadata: { key: 'value' },
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPriceId);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should deactivate a price', async () => {
    const fakeDeactivatedPrice = {
      id: testPriceId,
      active: false,
    };
    (stripeStub.prices.update as sinon.SinonStub).resolves(fakeDeactivatedPrice);

    const response = await supertest(server)
      .delete(`/api/stripe/prices/${testPriceId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Price deactivated successfully.',
    );
  });

  it('should return 404 for non-existent price', async () => {
    (stripeStub.prices.retrieve as sinon.SinonStub).rejects(new Error('Price not found'));

    const response = await supertest(server)
      .get('/api/stripe/prices/non_existent_id')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Price not found.');
  });
});