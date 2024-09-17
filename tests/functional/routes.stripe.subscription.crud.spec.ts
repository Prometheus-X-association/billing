import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import StripeSubscriptionCrudService from '../../src/services/StripeSubscriptionCrudService';
import { getApp } from '../../src/app';

const stripeSubscriptionService =
  StripeSubscriptionCrudService.retrieveServiceInstance();

let server: http.Server;

const createTestSubscriptions = async () => {
  await stripeSubscriptionService.createSubscription(
    'cus_test_1',
    'price_test_1',
  );
  await stripeSubscriptionService.createSubscription(
    'cus_test_2',
    'price_test_2',
  );
  await stripeSubscriptionService.createSubscription(
    'cus_test_3',
    'price_test_3',
  );
};

describe('Stripe Subscription CRUD API', () => {
  before(async function () {
    await createTestSubscriptions();
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
    server.close();
  });

  it('should create a new subscription', async () => {
    const response = await supertest(server).post('/api/subscriptions').send({
      customerId: 'cus_test_3',
      priceId: 'price_test_3',
    });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('customer');
    expect(response.body.customer).to.equal('cus_test_3');
  });

  it('should retrieve an existing subscription by ID', async () => {
    const response = await supertest(server).get(
      '/api/subscriptions/sub_test_1',
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', 'sub_test_1');
    expect(response.body).to.have.property('customerId');
  });

  it('should update an existing subscription', async () => {
    const response = await supertest(server)
      .put('/api/subscriptions/sub_test_1')
      .send({
        metadata: { key: 'value' },
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', 'sub_test_1');
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should cancel an existing subscription', async () => {
    const response = await supertest(server).delete(
      '/api/subscriptions/sub_test_1',
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Subscription canceled successfully.',
    );
  });

  it('should return a 404 for a non-existent subscription', async () => {
    const response = await supertest(server).get(
      '/api/subscriptions/non_existent_id',
    );

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'Subscription not found');
  });

  it('should get all subscriptions', async () => {
    const response = await supertest(server).get('/api/subscriptions');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });
});
