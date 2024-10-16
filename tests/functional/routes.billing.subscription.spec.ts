import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import { getApp } from '../../src/app';
import http from 'http';
import BillingSubscriptionService from '../../src/services/BillingSubscriptionService';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Logger } from '../../src/libs/Logger';
import { encodeToBase64 } from '../../src/libs/base64';

const billingSubscriptionService =
  BillingSubscriptionService.retrieveServiceInstance();

let server: http.Server;
let mongoServer: MongoMemoryServer;

describe('Billing Subscription via API', function () {
  before(async function () {
    billingSubscriptionService.addSubscription([
      {
        _id: '_id_1',
        isActive: true,
        participant: 'http://catalog.api.com/participant-1',
        subscriptionType: 'limitDate',
        resource: 'http://catalog.api.com/resource-1',
        details: {
          limitDate: new Date('2024-12-31'),
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
        },
      },
      {
        _id: '_id_2',
        isActive: true,
        participant: 'http://catalog.api.com/participant-1',
        subscriptionType: 'usageCount',
        resources: ['http://catalog.api.com/resource-2', 'http://catalog.api.com/resource-3'],
        details: {
          usageCount: 10,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
        },
      },
      {
        _id: '_id_3',
        isActive: true,
        participant: 'http://catalog.api.com/participant-1',
        subscriptionType: 'payAmount',
        resource: 'http://catalog.api.com/resource-4',
        details: {
          payAmount: 100,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
        },
      },
    ]);

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    config.mongoURI = mongoUri;

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
    if (server) {
      await mongoose.disconnect();
      await mongoServer.stop();
      await new Promise<void>((resolve) => {
        server.close(() => {
          Logger.info({
            message: 'Test server closed',
          });
          resolve();
        });
      });
    }
  });

  it('should get participant subscriptions', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const response = await supertest(server).get(
      `/api/subscriptions/for/participant/${participant}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(3);
  });

  it('should get participant resource subscriptions', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-1');
    const response = await supertest(server).get(
      `/api/subscriptions/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get limit date subscriptions', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-1');
    const response = await supertest(server).get(
      `/api/subscriptions/limitdate/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get pay amount subscriptions', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-4');
    const response = await supertest(server).get(
      `/api/subscriptions/pay/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get usage count subscriptions', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-2');
    const response = await supertest(server).get(
      `/api/subscriptions/usage/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });

  it('should get last active usage count', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-2');
    const response = await supertest(server).get(
      `/api/subscriptions/lastactive/usage/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('subscriptionId');
    expect(response.body).to.have.property('usageCount');
  });

  it('should get last active pay amount', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-4');
    const response = await supertest(server).get(
      `/api/subscriptions/lastactive/pay/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('subscriptionId');
    expect(response.body).to.have.property('payAmount');
  });

  it('should get last active limit date', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-1');
    const response = await supertest(server).get(
      `/api/subscriptions/lastactive/limitdate/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('subscriptionId');
    expect(response.body).to.have.property('limitDate');
  });

  it('should check if has active subscription', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const resource = encodeToBase64('http://catalog.api.com/resource-1');
    const response = await supertest(server).get(
      `/api/subscriptions/hasactive/for/resource/${participant}/${resource}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body)
      .to.have.property('hasActiveSubscription')
      .to.be.a('boolean');
  });

  it('should get all subscriptions', async () => {
    const response = await supertest(server).get('/api/subscriptions');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(3);
  });
});
