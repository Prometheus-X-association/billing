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
let testCustomerId: string;
let testConnectedAccountId: string = 'acct_123456789';
let stripeStub: Stripe;

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

    // Set up Stripe stub
    stripeStub = {
      customers: {
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

  it('should create a new customer', async () => {
    const fakeCustomer = {
      id: 'cus_123456789',
      email: 'test_customer_1@example.com',
      name: 'Test Customer 1',
    };
    (stripeStub.customers.create as sinon.SinonStub).resolves(fakeCustomer);

    const response = await supertest(server)
      .post('/api/stripe/customers')
      .set('stripe-account', testConnectedAccountId)
      .send({
        email: 'test_customer_1@example.com',
        name: 'Test Customer 1',
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('email', 'test_customer_1@example.com');
    testCustomerId = response.body.id;
  });

  it('should retrieve an existing customer by ID', async () => {
    const fakeCustomer = {
      id: testCustomerId,
      email: 'test_customer_1@example.com',
      name: 'Test Customer 1',
    };
    (stripeStub.customers.retrieve as sinon.SinonStub).resolves(fakeCustomer);

    const response = await supertest(server)
      .get(`/api/stripe/customers/${testCustomerId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testCustomerId);
    expect(response.body).to.have.property('email', 'test_customer_1@example.com');
  });

  it('should update an existing customer', async () => {
    const fakeUpdatedCustomer = {
      id: testCustomerId,
      email: 'test_customer_1@example.com',
      name: 'Test Customer 1',
      metadata: { key: 'value' },
    };
    (stripeStub.customers.update as sinon.SinonStub).resolves(fakeUpdatedCustomer);

    const response = await supertest(server)
      .put(`/api/stripe/customers/${testCustomerId}`)
      .set('stripe-account', testConnectedAccountId)
      .send({
        metadata: { key: 'value' },
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testCustomerId);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should get all customers', async () => {
    const fakeCustomersList = {
      data: [
        {
          id: testCustomerId,
          email: 'test_customer_1@example.com',
          name: 'Test Customer 1',
        },
      ],
      has_more: false,
    };
    (stripeStub.customers.list as sinon.SinonStub).resolves(fakeCustomersList);

    const response = await supertest(server)
      .get('/api/stripe/customers')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const customer = response.body.find((cust: any) => cust.id === testCustomerId);
    expect(customer).to.exist;
    expect(customer.email).to.equal('test_customer_1@example.com');
  });

  it('should delete an existing customer', async () => {
    const fakeDeletedCustomer = {
      id: testCustomerId,
      deleted: true,
    };
    (stripeStub.customers.del as sinon.SinonStub).resolves(fakeDeletedCustomer);

    const response = await supertest(server)
      .delete(`/api/stripe/customers/${testCustomerId}`)
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message', 'Customer deleted successfully.');
  });

  it('should return a 404 for a non-existent customer', async () => {
    (stripeStub.customers.retrieve as sinon.SinonStub).rejects(new Error('Customer not found'));

    const response = await supertest(server)
      .get('/api/stripe/customers/non_existent_id')
      .set('stripe-account', testConnectedAccountId);

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Customer not found.');
  });
});
