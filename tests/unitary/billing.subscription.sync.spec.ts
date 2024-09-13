import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import sinon from 'sinon';
import BillingSubscriptionService from '../../src/services/BillingSubscriptionService';
import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';
import SubscriptionModel from '../../src/models/SubscriptionModel';
import {
  Subscription,
  SubscriptionType,
} from '../../src/types/billing.subscription.types';

describe('Subscription Sync Service', function () {
  const now = new Date();
  let mongoServer: MongoMemoryServer;
  let subscriptionService: BillingSubscriptionService;
  let syncService: BillingSubscriptionSyncService;

  before(function () {
    return (async () => {
      this.timeout(10000);
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      subscriptionService = new BillingSubscriptionService();
      syncService = new BillingSubscriptionSyncService();
      await syncService.connect(mongoUri);
      syncService.setBillingService(subscriptionService);
      await syncService.refresh();
    })();
  });

  after(function () {
    return (async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    })();
  });

  it('should load subscriptions via sync service and verify them in billing service', async function () {
    const testSubscriptions: Omit<Subscription, '_id'>[] = [
      {
        isActive: true,
        participantId: 'participant1',
        subscriptionType: 'limitDate' as SubscriptionType,
        resourceId: 'resource1',
        details: {
          limitDate: new Date(now.getTime() + 86400000),
          startDate: now,
          endDate: new Date(now.getTime() + 86400000),
        },
      },
      {
        isActive: true,
        participantId: 'participant2',
        subscriptionType: 'payAmount' as SubscriptionType,
        resourceId: 'resource2',
        details: {
          payAmount: 100,
          startDate: now,
          endDate: new Date(now.getTime() + 86400000),
        },
      },
      {
        isActive: false,
        participantId: 'participant3',
        subscriptionType: 'usageCount' as SubscriptionType,
        resourceId: 'resource3',
        details: {
          usageCount: 5,
          startDate: now,
          endDate: new Date(now.getTime() + 86400000),
        },
      },
    ];

    await SubscriptionModel.insertMany(testSubscriptions);

    const loadedSubscriptions = subscriptionService.getAllActiveSubscriptions();
    expect(loadedSubscriptions).to.have.lengthOf(2);

    const isValidDate = (date: any) =>
      date instanceof Date && !isNaN(date.getTime());

    const compareSubscription = (
      actual: Subscription,
      expected: Omit<Subscription, '_id'>,
    ) => {
      expect(actual).to.include({
        isActive: expected.isActive,
        participantId: expected.participantId,
        subscriptionType: expected.subscriptionType,
        resourceId: expected.resourceId,
      });
      expect(
        isValidDate(actual.details.startDate),
        'Expect "startDate" to be valid',
      ).to.be.true;
      expect(
        isValidDate(actual.details.endDate),
        'Expect "endDate" to be valid',
      ).to.be.true;

      if (expected.details.limitDate) {
        expect(
          isValidDate(actual.details.limitDate),
          'Expect "limitDate" to be valid',
        ).to.be.true;
      } else if (expected.details.payAmount) {
        expect(
          actual.details.payAmount,
          'Expect actual "payAmount" to equal expected "payAmount"',
        ).to.equal(expected.details.payAmount);
      } else if (expected.details.usageCount) {
        expect(
          actual.details.usageCount,
          'Expect actual "usageCount" to equal expected "usageCount"',
        ).to.equal(expected.details.usageCount);
      }
    };

    compareSubscription(loadedSubscriptions[0], testSubscriptions[0]);
    compareSubscription(loadedSubscriptions[1], testSubscriptions[1]);

    expect(loadedSubscriptions).to.not.deep.include(testSubscriptions[2]);
  });

  it('should handle delete operation and remove subscription from billing service', async function () {
    const mockSubscriptionData: Omit<Subscription, '_id'> = {
      isActive: true,
      participantId: 'participant123',
      subscriptionType: 'limitDate' as SubscriptionType,
      resourceId: 'resource123',
      details: {
        limitDate: new Date(now.getTime() + 86400000),
        startDate: now,
        endDate: new Date(now.getTime() + 172800000),
      },
    };

    const removeSubscriptionByIdSpy = sinon.spy(
      subscriptionService,
      'removeSubscriptionById',
    );

    const addSubscriptionSpy = sinon.spy(
      subscriptionService,
      'addSubscription',
    );

    const mockSubscription = new SubscriptionModel(mockSubscriptionData);
    await mockSubscription.save();
    const savedId = mockSubscription._id;

    await SubscriptionModel.findByIdAndDelete(savedId);

    expect(
      addSubscriptionSpy.calledWith(
        sinon.match({
          participantId: 'participant123',
        }),
      ),
      'Expect addSubscription to be called',
    ).to.be.true;

    expect(
      removeSubscriptionByIdSpy.calledWith(savedId.toString()),
      'Expect removeSubscriptionById to be called',
    ).to.be.true;

    const subscriptions =
      subscriptionService.getParticipantSubscriptions('participant123');

    expect(
      subscriptions,
      'Expect subscriptions array to be empty',
    ).to.have.lengthOf(0);

    removeSubscriptionByIdSpy.restore();
    addSubscriptionSpy.restore();
  });
});
