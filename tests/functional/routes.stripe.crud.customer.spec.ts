import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import StripeCustomerCrudService from '../../src/services/StripeCustomerCrudService';
import { getApp } from '../../src/app';
import { _logYellow } from '../utils/utils';

const stripeCustomerService =
  StripeCustomerCrudService.retrieveServiceInstance();

let server: http.Server;

let testCustomerId: string;

describe('Stripe Customer CRUD API', function () {
  const title = this.title;
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
  });

  after(async () => {
    if (testCustomerId) {
      await stripeCustomerService.deleteCustomer(testCustomerId);
    }
    server.close();
  });

  it('should create a new customer', async () => {
    const response = await supertest(server)
      .post('/api/stripe/customers')
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
    const response = await supertest(server).get(
      `/api/stripe/customers/${testCustomerId}`,
    );
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
      .send({
        metadata: { key: 'value' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testCustomerId);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should get all customers', async () => {
    const response = await supertest(server).get('/api/stripe/customers');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const customer = response.body.find(
      (cust: any) => cust.id === testCustomerId,
    );
    expect(customer).to.exist;
    expect(customer.email).to.equal('test_customer_1@example.com');
  });

  it('should delete an existing customer', async () => {
    const response = await supertest(server).delete(
      `/api/stripe/customers/${testCustomerId}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Customer deleted successfully.',
    );
    testCustomerId = '';
  });

  it('should return a 404 for a non-existent customer', async () => {
    const response = await supertest(server).get(
      '/api/stripe/customers/non_existent_id',
    );
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Customer not found.');
  });
});
