import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import { getApp } from '../../src/app';
import StripeConnectedAccountService from '../../src/services/StripeConnectedAccountService';
import { Logger } from '../../src/libs/Logger';

let server: http.Server;
let testProduct1: string | undefined;
let testConnectedAccountId: string | undefined;

const stripeConnectedAccountService =
  StripeConnectedAccountService.retrieveServiceInstance();

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

    // Create a connected account
    const connectedAccount = await stripeConnectedAccountService.createConnectedAccount({
      type: 'standard',
      country: 'US',
      email: 'test_connected_account@example.com',
    });
    testConnectedAccountId = connectedAccount?.id;
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

  it('should create a new product', async () => {
    const response = await supertest(server)
      .post('/api/stripe/products')
      .set('stripe-account', testConnectedAccountId as string)
      .send({
        name: 'New Test Product',
        description: 'A test product',
      });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('name', 'New Test Product');
    testProduct1 = response.body.id;
  });

  it('should retrieve all products', async () => {
    const response = await supertest(server)
      .get('/api/stripe/products')
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const product = response.body.find((p: any) => p.id === testProduct1);
    expect(product).to.exist;
  });

  it('should retrieve a product by ID', async () => {
    const response = await supertest(server)
      .get(`/api/stripe/products/${testProduct1}`)
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testProduct1);
    expect(response.body).to.have.property('name');
  });

  it('should update an existing product', async () => {
    const response = await supertest(server)
      .put(`/api/stripe/products/${testProduct1}`)
      .set('stripe-account', testConnectedAccountId as string)
      .send({
        name: 'Updated Test Product',
        description: 'An updated description',
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testProduct1);
    expect(response.body).to.have.property('name', 'Updated Test Product');
  });

  it('should deactivate a product', async () => {
    const response = await supertest(server)
      .delete(`/api/stripe/products/${testProduct1}`)
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Product deleted successfully.',
    );
  });

  it('should return 404 for non-existent product', async () => {
    const response = await supertest(server)
      .get('/api/stripe/products/non_existent_id')
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Product not found.');
  });
});
