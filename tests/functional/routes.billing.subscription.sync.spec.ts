import supertest from 'supertest';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '../../src/config/environment';

import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';
import { getApp } from '../../src/app';
import http from 'http';
import { _logYellow, _logGreen, _logObject } from '../utils/utils';
import SubscriptionModel from '../../src/models/SubscriptionModel';

let server: http.Server;
let mongoServer: MongoMemoryServer;

describe('Billing Subscription Sync Service via API', () => {
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
        console.log(`Test server is running on port ${port}`);
        resolve(true);
      });
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
    Reflect.set(
      BillingSubscriptionSyncService.prototype,
      'connect',
      syncConnect,
    );
  });

  it('should add subscriptions', async () => {
    _logYellow('\n- Add Subscriptions');
    const subscriptions = [
      {
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
        isActive: true,
        participantId: 'participant-2',
        subscriptionType: 'usageCount',
        resourceId: 'resource-2',
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

    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(201);
    expect(response.body).to.be.an('array').with.lengthOf(2);

    const addedSubscriptions = await SubscriptionModel.find({});
    expect(addedSubscriptions).to.have.lengthOf(2);
  });

  it('should remove a subscription', async () => {
    _logYellow('\n- Remove Subscription');
    const subscription = new SubscriptionModel({
      isActive: true,
      participantId: 'participant-3',
      subscriptionType: 'payAmount',
      resourceId: 'resource-3',
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

    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(204);
    // expect(response.body.message).to.equal('Subscription removed successfully');

    const removedSubscription =
      await SubscriptionModel.findById(subscriptionId);
    expect(removedSubscription).to.be.null;
  });

  it('should return 404 when trying to remove a non-existent subscription', async () => {
    _logYellow('\n- Remove Non-existent Subscription');
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await supertest(server).delete(
      `/api/sync/subscriptions/${nonExistentId}`,
    );

    _logGreen('Response:');
    _logObject(response.body);
    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal('Subscription not found');
  });
});
