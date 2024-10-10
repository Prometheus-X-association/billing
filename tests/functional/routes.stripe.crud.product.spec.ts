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
let testProductId: string;
let stripeStub: Stripe;

describe('Stripe Product CRUD API', function () {
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
      products: {
        create: sinon.stub(),
        retrieve: sinon.stub(),
        update: sinon.stub(),
        del: sinon.stub(),
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

  it('should create a new product', async () => {
    const fakeProduct = {
      id: 'prod_123456789',
      name: 'New Test Product',
      description: 'A test product',
    };
    (stripeStub.products.create as sinon.SinonStub).resolves(fakeProduct);

    const response = await supertest(server)
      .post('/api/stripe/products')
      .set('stripe-account', testConnectedAccountId)
      .send({
        name: 'New Test Product',
        description: 'A test product',
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('name', 'New Test Product');
    testProductId = response.body.id;
  });

  it('should retrieve all products', async () => {
    const fakeProductsList = {
      data: [
        {
          id: testProductId,
          name: 'New Test Product',
          description: 'A test product',
        },
      ],
      has_more: false,
    };
    (stripeStub.products.list as sinon.SinonStub).resolves(fakeProductsList);

    const response = await supertest(server)
      .get('/api/stripe/products')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const product = response.body.find((p: any) => p.id === testProductId);
    expect(product).to.exist;
  });

  it('should retrieve a product by ID', async () => {
    const fakeProduct = {
      id: testProductId,
      name: 'New Test Product',
      description: 'A test product',
    };
    (stripeStub.products.retrieve as sinon.SinonStub).resolves(fakeProduct);

    const response = await supertest(server)
      .get(`/api/stripe/products/${testProductId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testProductId);
    expect(response.body).to.have.property('name');
  });

  it('should update an existing product', async () => {
    const fakeUpdatedProduct = {
      id: testProductId,
      name: 'Updated Test Product',
      description: 'An updated description',
    };
    (stripeStub.products.update as sinon.SinonStub).resolves(fakeUpdatedProduct);

    const response = await supertest(server)
      .put(`/api/stripe/products/${testProductId}`)
      .set('stripe-account', testConnectedAccountId)
      .send({
        name: 'Updated Test Product',
        description: 'An updated description',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testProductId);
    expect(response.body).to.have.property('name', 'Updated Test Product');
  });

  it('should deactivate a product', async () => {
    const fakeDeletedProduct = {
      id: testProductId,
      deleted: true,
    };
    (stripeStub.products.del as sinon.SinonStub).resolves(fakeDeletedProduct);

    const response = await supertest(server)
      .delete(`/api/stripe/products/${testProductId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Product deleted successfully.',
    );
  });

  it('should return 404 for non-existent product', async () => {
    (stripeStub.products.retrieve as sinon.SinonStub).rejects(new Error('Product not found'));

    const response = await supertest(server)
      .get('/api/stripe/products/non_existent_id')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Product not found.');
  });
});
