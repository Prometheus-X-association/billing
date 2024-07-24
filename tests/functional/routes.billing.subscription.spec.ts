import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import { getServerApp } from '../../src/server';
import http from 'http';
import { _logYellow, _logGreen, _logObject } from '../utils/utils';
import BillingSubscriptionService from '../../src/services/BillingSubscriptionService';

const billingSubscriptionService = BillingSubscriptionService.getService();

let server: http.Server;

describe('Billing Subscription via API', () => {
  before(async () => {
    billingSubscriptionService.addSubscription([
      {
        _id: '_id_1',
        isActive: true,
        participantId: 'participant-1',
        subscriptionType: 'subscriptionDateTime',
        resourceId: 'resource-1',
        details: {
          subscriptionDateTime: new Date('2024-12-31'),
        },
      },
      {
        _id: '_id_2',
        isActive: true,
        participantId: 'participant-1',
        subscriptionType: 'usageCount',
        resourceIds: ['resource2', 'resource3'],
        details: {
          usageCount: 10,
        },
      },
    ]);
    const app = await getServerApp();
    await new Promise((resolve) => {
      const { port } = config;
      server = app.listen(port, () => {
        console.log(`Test server is running on port ${port}`);
        resolve(true);
      });
    });
  });

  after(() => {
    server.close();
  });

  it('should get participant subscriptions', async () => {
    _logYellow('\n- Get Participant subscriptions');
    const participantId = 'participant-1';
    const response = await supertest(server).get(
      `/api/subscriptions/for/participant/${participantId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  it('should get resource subscriptions', async () => {
    _logYellow('\n- Get Resource subscription');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  it('should get group subscriptions', async () => {
    _logYellow('\n- Get Group subscription');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/group/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  it('should get DateTime subscriptions', async () => {
    _logYellow('\n- Get DateTime subscription');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/datetime/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  it('should get subscription pay amount', async () => {
    _logYellow('\n- Get PayAmount subscription');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/pay/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  it('should get subscription usage count', async () => {
    _logYellow('\n- Get UsageCount subscription');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/usage/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  it('should get all subscriptions', async () => {
    _logYellow('\n- Get all subscriptions');
    const response = await supertest(server).get('/api/subscriptions');
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });
});
