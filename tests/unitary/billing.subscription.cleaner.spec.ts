import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import sinon from 'sinon';
import SubscriptionModel from '../../src/models/SubscriptionModel';
import { BillingSubscriptionCleanRefresh } from '../../src/services/BillingSubscriptionCleanRefresh';
import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';
import { _logYellow } from '../utils/utils';

describe('BillingSubscriptionCleanRefresh Service', function () {
  const title = this.title;
  let mongoServer: MongoMemoryServer;
  let syncService: BillingSubscriptionSyncService;
  let billingCleanRefresh: BillingSubscriptionCleanRefresh;

  before(async () => {
    _logYellow(`- ${title} running...`);
    this.timeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    syncService = sinon.createStubInstance(BillingSubscriptionSyncService);
    billingCleanRefresh = new BillingSubscriptionCleanRefresh({}, syncService);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await SubscriptionModel.deleteMany({});
    sinon.restore();
  });

  it('should update and disable expired payAmount subscriptions', async function () {
    const now = new Date();

    const testSubscriptions = [
      {
        isActive: true,
        subscriptionType: 'payAmount',
        details: {
          payAmount: 100,
          startDate: new Date(now.getTime() - 86400000), // 1 day
          endDate: new Date(now.getTime() - 1000), // 1 second
        },
        participantId: 'participant_a',
      },
      {
        isActive: true,
        subscriptionType: 'payAmount',
        details: {
          payAmount: 50,
          startDate: new Date(now.getTime() - 86400000),
          endDate: new Date(now.getTime() + 86400000),
        },
        participantId: 'participant_b',
      },
    ];

    await SubscriptionModel.insertMany(testSubscriptions);
    const updateExpiredSubscriptionsMethod = Reflect.get(
      billingCleanRefresh,
      'updateExpiredSubscriptions',
    );
    await updateExpiredSubscriptionsMethod.call(billingCleanRefresh);

    const updatedSubscriptions = await SubscriptionModel.find();
    expect(updatedSubscriptions[0].isActive).to.be.false;
    expect(updatedSubscriptions[1].isActive).to.be.true;
  });

  it('should update and deactivate expired limitDate subscriptions', async function () {
    const now = new Date();

    const testSubscriptions = [
      {
        isActive: true,
        subscriptionType: 'limitDate',
        details: {
          limitDate: new Date(now.getTime() - 1000),
          startDate: new Date(now.getTime() - 86400000),
          endDate: new Date(now.getTime() + 86400000),
        },
        participantId: 'participant_c',
      },
      {
        isActive: true,
        subscriptionType: 'limitDate',
        details: {
          limitDate: new Date(now.getTime() + 86400000),
          startDate: new Date(now.getTime() - 86400000),
          endDate: new Date(now.getTime() + 86400000),
        },
        participantId: 'participant_d',
      },
    ];

    await SubscriptionModel.insertMany(testSubscriptions);

    const updateExpiredSubscriptionsMethod = Reflect.get(
      billingCleanRefresh,
      'updateExpiredSubscriptions',
    );
    await updateExpiredSubscriptionsMethod.call(billingCleanRefresh);

    const updatedSubscriptions = await SubscriptionModel.find();
    expect(updatedSubscriptions[0].isActive).to.be.false;
    expect(updatedSubscriptions[1].isActive).to.be.true;
  });

  it('should trigger the cron job and execute updateExpiredSubscriptions', async function (done) {
    this.timeout(5000);
    const testConfig = {
      cronSchedule: '*/1 * * * * *',
    };

    billingCleanRefresh = new BillingSubscriptionCleanRefresh(
      testConfig,
      syncService,
    );

    const updateStub = sinon
      .stub(billingCleanRefresh as any, 'updateExpiredSubscriptions')
      .resolves();

    await billingCleanRefresh.start();

    setTimeout(() => {
      expect(updateStub.calledOnce).to.be.true;
      billingCleanRefresh.stop();
      done();
    }, 2000);
  });
});
