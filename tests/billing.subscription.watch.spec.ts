import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import sinon from 'sinon';
import BillingSubscriptionService, {
  Subscription,
} from '../src/services/BillingSubscriptionService';
import SubscriptionChangeWatcher from '../src/services/BillingSubscriptionWatchService';
import SubscriptionModel from '../src/models/SubscriptionModel';

describe('SubscriptionChangeWatcher', function () {
  let mongoServer: MongoMemoryServer;
  let billingService: BillingSubscriptionService;
  let watcher: SubscriptionChangeWatcher;

  before(async function () {
    this.timeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    billingService = new BillingSubscriptionService();
    watcher = new SubscriptionChangeWatcher(mongoUri, billingService);
  });

  after(async function () {
    await mongoose.disconnect();
    await mongoServer.stop();
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
      billingService,
      'removeSubscriptionById',
    );

    const addSubscriptionSpy = sinon.spy(billingService, 'addSubscription');

    // watch not working with MongoMemoryServer
    await (watcher as any).handleChange({
      operationType: 'insert',
      documentKey: { _id: savedId },
      fullDocument: {
        _id: savedId.toString(),
        ...mockSubscriptionData,
      },
    });
    await (watcher as any).handleChange({
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
      billingService.getParticipantSubscriptions('participant123');
    expect(
      subscriptions,
      'Expect subscriptions array to be empty',
    ).to.have.lengthOf(0);

    removeSubscriptionByIdSpy.restore();
  });
});
