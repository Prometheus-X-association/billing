import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import { config } from '../../src/config/environment';
import http from 'http';
import { getApp } from '../../src/app';
import { Logger } from '../../src/libs/Logger';

let server: http.Server;
let testConnectedAccountId: string;
const id: string = 'acct_50726F6D6574686575732058';
const email: string = 'test_connected_account@example.com';
const type: string = 'express';
describe('Stripe Connected Account CRUD API', function () {
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
  });

  after(async () => {
    sinon.reset();
    if (server) {
      server.close(() => {
        Logger.info({
          message: 'Test server closed',
        });
      });
    }
  });

  it('should create a new connected account', async () => {
    const response = await supertest(server).post('/api/stripe/accounts').send({
      type,
      country: 'FR',
      email,
    });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('type', type);
    testConnectedAccountId = response.body.id;
  });

  it('should retrieve an existing connected account by ID', async () => {
    const response = await supertest(server).get(
      `/api/stripe/accounts/${testConnectedAccountId}`,
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testConnectedAccountId);
    expect(response.body).to.have.property('type', type);
  });

  it('should update an existing connected account', async () => {
    const response = await supertest(server)
      .post(`/api/stripe/accounts/${testConnectedAccountId}`)
      .send({
        metadata: { key: 'value' },
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testConnectedAccountId);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should return a 404 for a not completed onboarding', async () => {
    const response = await supertest(server).post(
      `/api/stripe/accounts/${testConnectedAccountId}/login_links`,
    );

    expect(response.status).to.equal(404);
  });

  it('should create a new account link', async () => {
    const response = await supertest(server).post(
      `/api/stripe/accounts/${testConnectedAccountId}/account_links`,
    ).send({
      refresh_url: 'https://www.test.com',
      return_url: 'https://www.test.com',
      type: 'account_onboarding',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('url');
    expect(response.body).to.have.property('object', 'account_link');
  });

  it('should delete an existing connected account', async () => {
    const response = await supertest(server).delete(
      `/api/stripe/accounts/${testConnectedAccountId}`,
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Connected account deleted successfully.',
    );
  });

  it('should return a 404 for a non-existent connected account', async () => {
    const response = await supertest(server).get(
      '/api/stripe/accounts/non_existent_id',
    );

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property(
      'message',
      'Connected account not found.',
    );
  });
});
