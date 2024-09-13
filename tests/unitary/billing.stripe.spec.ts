import { expect } from 'chai';
import sinon from 'sinon';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionService';
import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';
import { Subscription } from '../../src/types/billing.subscription.types';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import BillingSubscriptionService from '../../src/services/BillingSubscriptionService';

const email = 'test@example.com';
const customerId = 'test_customer_id';
describe('StripeService test cases', () => {
  let stripeStub: {
    customers: {
      create: sinon.SinonStub;
    };
  };
  let stripeService: StripeService;
  let mongoServer: MongoMemoryServer;
  let syncService: BillingSubscriptionSyncService;
  let subscriptionService: BillingSubscriptionService;
  let subscriptions: any[];
  before(async function () {
    this.timeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    subscriptionService = new BillingSubscriptionService();
    syncService = new BillingSubscriptionSyncService();
    await syncService.connect(mongoUri);
    syncService.setBillingService(subscriptionService);
    await syncService.refresh();

    sinon
      .stub(BillingSubscriptionSyncService, 'retrieveServiceInstance' as any)
      .returns(syncService);

    stripeStub = {
      customers: {
        create: sinon.stub().resolves({ id: customerId } as Stripe.Customer),
      },
    };
    sinon
      .stub(StripeService.prototype, 'getNewStripe' as any)
      .returns(stripeStub);

    stripeService = StripeService.retrieveServiceInstance();
  });

  after(() => {
    sinon.restore();
  });

  it('should create a new customer and return the customer ID', async () => {
    const stripeService = StripeService.retrieveServiceInstance();
    const customer = await stripeService.connect(email);
    expect(customer).to.not.be.null;
    expect(
      stripeStub.customers.create.calledOnceWithExactly({
        email,
      }),
    ).to.be.true;
    if (customer) {
      expect(customer.id).to.equal(customerId);
    }
  });

  it('should return the same instance of StripeService (singleton)', () => {
    const instance1 = StripeService.retrieveServiceInstance();
    const instance2 = StripeService.retrieveServiceInstance();
    expect(instance1).to.equal(instance2);
  });

  it('should handle "customer.subscription.created" event and call addSubscriptions in BillingSubscriptionSyncService', async () => {
    // Spy on addSubscriptions method in the sync service
    let billingSubscriptionSyncServiceStub: sinon.SinonStub = sinon
      .stub(BillingSubscriptionSyncService.prototype, 'addSubscriptions')
      .resolves();

    const now = new Date();
    const fakeSubscription: Subscription = {
      stripeId: 'test_subscription_id',
      isActive: true,
      participantId: 'test_participant_id',
      subscriptionType: 'payAmount',
      resourceId: 'test_resource_id',
      resourceIds: [],
      details: {
        startDate: new Date(now.getTime() - 86400000), // 1 day
        endDate: new Date(now.getTime() - 1000), // 1 second
      },
    };

    // tmp stub
    const formatStripeSubscription = sinon
      .stub(stripeService as any, 'formatStripeSubscription')
      .resolves(fakeSubscription);

    const event = {
      type: 'customer.subscription.created',
      data: {
        object: { id: 'test_subscription_id' },
      },
    } as Stripe.Event;
    await stripeService.handleWebhook(event);

    expect(billingSubscriptionSyncServiceStub.calledOnce).to.be.true;
    expect(
      billingSubscriptionSyncServiceStub.calledWithExactly([fakeSubscription]),
    ).to.be.true;

    // Restore subscription and call the previously subscribed/cancelled addSubscription
    billingSubscriptionSyncServiceStub.restore();
    const billingSyncServiceInstance =
      await BillingSubscriptionSyncService.retrieveServiceInstance();
    subscriptions = await billingSyncServiceInstance.addSubscriptions([
      fakeSubscription,
    ]);

    formatStripeSubscription.restore();
  });

  it('should handle "customer.subscription.deleted" event and call removeSubscription from sync service', async () => {
    const removeSubscriptionStub = sinon
      .stub(BillingSubscriptionSyncService.prototype, 'removeSubscription')
      .resolves();

    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: { id: 'test_subscription_id' },
      },
    } as Stripe.Event;

    await stripeService.handleWebhook(event);
    expect(removeSubscriptionStub.calledOnce).to.be.true;

    const ids = subscriptions.map((sub) => sub.id);
    expect(
      removeSubscriptionStub.calledWithExactly(ids[0]) ||
        ids.some((id) => removeSubscriptionStub.calledWithExactly(id)),
    ).to.be.true;

    removeSubscriptionStub.restore();
  });
});
