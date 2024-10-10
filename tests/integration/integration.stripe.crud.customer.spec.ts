import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import StripeCustomerCrudService from '../../src/services/StripeCustomerCrudService';
import StripeConnectedAccountService from '../../src/services/StripeConnectedAccountService';
import { getApp } from '../../src/app';
import { Logger } from '../../src/libs/Logger';

const stripeCustomerService =
  StripeCustomerCrudService.retrieveServiceInstance();
const stripeConnectedAccountService =
  StripeConnectedAccountService.retrieveServiceInstance();

let server: http.Server;

let testCustomerId: string;
let testConnectedAccountId: string | undefined;

describe('Stripe Customer CRUD API', function () {
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
      if (testCustomerId && testConnectedAccountId) {
        await stripeCustomerService.deleteCustomer(testCustomerId, { stripeAccount: testConnectedAccountId });
      }
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

  it('should create a new customer', async () => {
    const response = await supertest(server)
      .post('/api/stripe/customers')
      .set('stripe-account', testConnectedAccountId as string)
      .send({
        email: 'test_customer_1@example.com',
        name: 'Test Customer 1',
      });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property(
      'email',
      'test_customer_1@example.com',
    );
    testCustomerId = response.body.id;
  });

  it('should retrieve an existing customer by ID', async () => {
    const response = await supertest(server)
      .get(`/api/stripe/customers/${testCustomerId}`)
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testCustomerId);
    expect(response.body).to.have.property(
      'email',
      'test_customer_1@example.com',
    );
  });

  it('should update an existing customer', async () => {
    const response = await supertest(server)
      .put(`/api/stripe/customers/${testCustomerId}`)
      .set('stripe-account', testConnectedAccountId as string)
      .send({
        metadata: { key: 'value' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testCustomerId);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should get all customers', async () => {
    const response = await supertest(server)
      .get('/api/stripe/customers')
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const customer = response.body.find(
      (cust: any) => cust.id === testCustomerId,
    );
    expect(customer).to.exist;
    expect(customer.email).to.equal('test_customer_1@example.com');
  });

  it('should delete an existing customer', async () => {
    const response = await supertest(server)
      .delete(`/api/stripe/customers/${testCustomerId}`)
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Customer deleted successfully.',
    );
    testCustomerId = '';
  });

  it('should return a 404 for a non-existent customer', async () => {
    const response = await supertest(server)
      .get('/api/stripe/customers/non_existent_id')
      .set('stripe-account', testConnectedAccountId as string);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Customer not found.');
  });
});
