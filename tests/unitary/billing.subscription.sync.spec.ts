import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import sinon from 'sinon';
import BillingSubscriptionService, {
  Subscription,
} from '../../src/services/BillingSubscriptionService';
import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';
import SubscriptionModel from '../../src/models/SubscriptionModel';

describe('Subscription Sync Service', function () {
  let mongoServer: MongoMemoryServer;
  let subscriptionService: BillingSubscriptionService;
  let syncService: BillingSubscriptionSyncService;

  before(async function () {
    this.timeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    subscriptionService = new BillingSubscriptionService();
    syncService = new BillingSubscriptionSyncService(mongoUri);
    syncService.setBillingService(subscriptionService);
  });

  after(async function () {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should load subscriptions via sync service and verify them in billing service', async function () {
    const testSubscriptions = [
      {
        isActive: true,
        participantId: 'participant1',
        subscriptionType: 'subscriptionDateTime',
        resourceId: 'resource1',
        details: { subscriptionDateTime: new Date() },
      },
      {
        isActive: true,
        participantId: 'participant2',
        subscriptionType: 'payAmount',
        resourceId: 'resource2',
        details: { payAmount: 100 },
      },
      {
        isActive: false,
        participantId: 'participant3',
        subscriptionType: 'usageCount',
        resourceId: 'resource3',
        details: { usageCount: 5 },
      },
    ];

    await SubscriptionModel.insertMany(testSubscriptions);
    await syncService.loadSubscriptions();

    const loadedSubscriptions = subscriptionService.getAllSubscriptions();

    expect(loadedSubscriptions).to.have.lengthOf(2);

    const isValidDate = (date: any) =>
      date instanceof Date && !isNaN(date.getTime());

    const compareSubscription = (actual: any, expected: any) => {
      expect(actual).to.include({
        isActive: expected.isActive,
        participantId: expected.participantId,
        subscriptionType: expected.subscriptionType,
        resourceId: expected.resourceId,
      });

      if (expected.details.subscriptionDateTime) {
        expect(isValidDate(actual.details.subscriptionDateTime)).to.be.true;
      } else {
        expect(actual.details).to.deep.equal(expected.details);
      }
    };

    compareSubscription(loadedSubscriptions[0], {
      isActive: true,
      participantId: 'participant1',
      subscriptionType: 'subscriptionDateTime',
      resourceId: 'resource1',
      details: { subscriptionDateTime: new Date() },
    });

    compareSubscription(loadedSubscriptions[1], {
      isActive: true,
      participantId: 'participant2',
      subscriptionType: 'payAmount',
      resourceId: 'resource2',
      details: { payAmount: 100 },
    });

    expect(loadedSubscriptions).to.not.deep.include({
      isActive: false,
      participantId: 'participant3',
      subscriptionType: 'usageCount',
      resourceId: 'resource3',
      details: { usageCount: 5 },
    });
  });

  it('should handle delete operation and remove subscription from billing service', async function () {
    const mockSubscriptionData: Omit<Subscription, '_id'> = {
      isActive: true,
      participantId: 'participant123',
      subscriptionType: 'subscriptionDateTime',
      resourceId: 'resource123',
      details: {
        subscriptionDateTime: new Date(),
      },
    };

    const mockSubscription = new SubscriptionModel(mockSubscriptionData);
    await mockSubscription.save();
    const savedId = mockSubscription._id as mongoose.Types.ObjectId;

    const removeSubscriptionByIdSpy = sinon.spy(
      subscriptionService,
      'removeSubscriptionById',
    );

    const addSubscriptionSpy = sinon.spy(
      subscriptionService,
      'addSubscription',
    );

    // watch not working with MongoMemoryServer
    await (syncService as any).handleChange({
      operationType: 'insert',
      documentKey: { _id: savedId },
      fullDocument: {
        _id: savedId.toString(),
        ...mockSubscriptionData,
      },
    });
    await (syncService as any).handleChange({
      operationType: 'delete',
      documentKey: { _id: savedId },
    });

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
  });
});
