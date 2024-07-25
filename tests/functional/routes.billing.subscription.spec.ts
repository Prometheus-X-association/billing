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
        subscriptionType: 'limitDate',
        resourceId: 'resource-1',
        details: {
          limitDate: new Date('2024-12-31'),
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
        },
      },
      {
        _id: '_id_2',
        isActive: true,
        participantId: 'participant-1',
        subscriptionType: 'usageCount',
        resourceIds: ['resource-2', 'resource-3'],
        details: {
          usageCount: 10,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
        },
      },
      {
        _id: '_id_3',
        isActive: true,
        participantId: 'participant-1',
        subscriptionType: 'payAmount',
        resourceId: 'resource-4',
        details: {
          payAmount: 100,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
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
    expect(response.body).to.be.an('array').with.lengthOf(3);
  });

  it('should get participant resource subscriptions', async () => {
    _logYellow('\n- Get Participant Resource subscriptions');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get limit date subscriptions', async () => {
    _logYellow('\n- Get LimitDate subscriptions');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/limitdate/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get pay amount subscriptions', async () => {
    _logYellow('\n- Get PayAmount subscriptions');
    const participantId = 'participant-1';
    const resourceId = 'resource-4';
    const response = await supertest(server).get(
      `/api/subscriptions/pay/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get usage count subscriptions', async () => {
    _logYellow('\n- Get UsageCount subscriptions');
    const participantId = 'participant-1';
    const resourceId = 'resource-2';
    const response = await supertest(server).get(
      `/api/subscriptions/usage/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get last active usage count', async () => {
    _logYellow('\n- Get Last Active UsageCount');
    const participantId = 'participant-1';
    const resourceId = 'resource-2';
    const response = await supertest(server).get(
      `/api/subscriptions/lastactive/usage/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('subscriptionId');
    expect(response.body).to.have.property('usageCount');
  });

  it('should get last active pay amount', async () => {
    _logYellow('\n- Get Last Active PayAmount');
    const participantId = 'participant-1';
    const resourceId = 'resource-4';
    const response = await supertest(server).get(
      `/api/subscriptions/lastactive/pay/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('subscriptionId');
    expect(response.body).to.have.property('payAmount');
  });

  it('should get last active limit date', async () => {
    _logYellow('\n- Get Last Active LimitDate');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/lastactive/limitdate/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('subscriptionId');
    expect(response.body).to.have.property('limitDate');
  });

  it('should check if has active subscription', async () => {
    _logYellow('\n- Check if has active subscription');
    const participantId = 'participant-1';
    const resourceId = 'resource-1';
    const response = await supertest(server).get(
      `/api/subscriptions/hasactive/for/resource/${participantId}/${resourceId}`,
    );
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body)
      .to.have.property('hasActiveSubscription')
      .to.be.a('boolean');
  });

  it('should get all subscriptions', async () => {
    _logYellow('\n- Get all subscriptions');
    const response = await supertest(server).get('/api/subscriptions');
    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(3);
  });
});
