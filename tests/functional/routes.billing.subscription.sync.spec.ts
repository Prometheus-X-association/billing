import supertest from 'supertest';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '../../src/config/environment';

import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';
import { getApp } from '../../src/app';
import http from 'http';
import SubscriptionModel from '../../src/models/SubscriptionModel';
import { Logger } from '../../src/libs/Logger';

let server: http.Server;
let mongoServer: MongoMemoryServer;
const participant = 'http://catalog.api.com/participant-4';
const stripeCustomerId = 'cus_123456';
const stripeAccount = 'acct_123456';

describe('Billing Subscription Sync Service via API', function () {
  let syncConnect: Function;
  before(async function () {
    this.timeout(10000);
    // bypass BillingSubscriptionSyncService connect method
    syncConnect = Reflect.get(
      BillingSubscriptionSyncService.prototype,
      'connect',
    );
    Reflect.set(
      BillingSubscriptionSyncService.prototype,
      'connect',
      function (_mongoUri: string | undefined) {},
    );

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
      server.close(() => {
        Logger.info({
          message: 'Test server closed',
        });
      });
      Reflect.set(
      BillingSubscriptionSyncService.prototype,
      'connect',
        syncConnect,
      );
    }
  });

  it('should add subscriptions', async () => {
    const subscriptions = [
      {
        isActive: true,
        participant: 'http://catalog.api.com/participant-1',
        subscriptionType: 'limitDate',
        resource: 'resource-1',
        details: {
          limitDate: new Date('2024-12-31'),
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
        },
      },
      {
        isActive: true,
        participant: 'http://catalog.api.com/participant-2',
        subscriptionType: 'usageCount',
        resource: 'resource-2',
        details: {
          usageCount: 10,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-12-31'),
        },
      },
    ];

    const response = await supertest(server)
      .post('/api/sync/subscriptions')
      .send(subscriptions);

    expect(response.status).to.equal(201);
    expect(response.body).to.be.an('array').with.lengthOf(2);

    const addedSubscriptions = await SubscriptionModel.find({});
    expect(addedSubscriptions).to.have.lengthOf(2);
  });

  it('should remove a subscription', async () => {
    const subscription = new SubscriptionModel({
      isActive: true,
      participant: 'http://catalog.api.com/participant-3',
      subscriptionType: 'payAmount',
      resource: 'resource-3',
      details: {
        payAmount: 100,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31'),
      },
    });
    await subscription.save();
    const subscriptionId = subscription._id.toString();
    const response = await supertest(server).delete(
      `/api/sync/subscriptions/${subscriptionId}`,
    );

    expect(response.status).to.equal(204);

    const removedSubscription =
      await SubscriptionModel.findById(subscriptionId);
    expect(removedSubscription).to.be.null;
  });

  it('should return 404 when trying to remove a non-existent subscription', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await supertest(server).delete(
      `/api/sync/subscriptions/${nonExistentId}`,
    );

    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal('Subscription not found');
  });

  it('should link participant to customer', async () => {
    const response = await supertest(server)
      .post('/api/stripe/link/customer')
      .send({ participant, stripeCustomerId });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Link established successfully');
  });

  it('should link participant to connected account', async () => {
    const response = await supertest(server)
      .post('/api/stripe/link/connect')
      .send({ participant, stripeAccount });

    expect(response.status).to.equal(200);
    expect(response.body.participant).to.equal(participant);
    expect(response.body.stripeAccount).to.equal(stripeAccount);
  });

  it('should unlink participant from customer', async () => {
    const response = await supertest(server)
      .delete(`/api/stripe/unlink/customer/${stripeCustomerId}`);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Link removed successfully');
  });

  it('should unlink participant from connected account', async () => {
    const response = await supertest(server)
      .delete(`/api/stripe/unlink/connect/${stripeAccount}`);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Link removed successfully');
  });
});
