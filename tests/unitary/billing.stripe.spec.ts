import { expect } from 'chai';
import sinon from 'sinon';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionSyncService';
import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';
import { Subscription } from '../../src/types/billing.subscription.types';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import BillingSubscriptionService from '../../src/services/BillingSubscriptionService';
import { _logYellow } from '../utils/utils';

const email = 'test@example.com';
describe('Billing Stripe sync service test cases', function () {
  const title = this.title;
  let stripeStub: {
    customers: {
      create: sinon.SinonStub;
    };
    subscriptions: {
      retrieve: sinon.SinonStub;
    };
  };
  let stripeService: StripeService;
  let mongoServer: MongoMemoryServer;
  let syncService: BillingSubscriptionSyncService;
  let subscriptionService: BillingSubscriptionService;
  let subscriptions: unknown[];
  before(async function () {
    _logYellow(`- ${title} running...`);

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
      subscriptions: {
        retrieve: sinon.stub(),
      },
    };
    sinon
      .stub(StripeService.prototype, 'getNewStripe' as any)
      .returns(stripeStub);

    /*
    const reflectedstripeService = Reflect.construct(StripeService, []);
    const retrieveServiceInstanceStub = sinon
      .stub(StripeService, 'retrieveServiceInstance' as any)
      .returns(reflectedstripeService);
    stripeService = StripeService.retrieveServiceInstance();
    retrieveServiceInstanceStub.restore();
    */
    stripeService = StripeService.retrieveServiceInstance();
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
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

  // it('should return the same instance of StripeService (singleton)', () => {
  // const instance1 = StripeService.retrieveServiceInstance();
  // const instance2 = StripeService.retrieveServiceInstance();
  // expect(instance1).to.equal(instance2);
  // });

  const subscriptionId = 'test_subscription_id';
  const participantId = 'test_participant_id';
  const customerId = 'test_customer_id';
  it('should handle "customer.subscription.created" event and call addSubscriptions in BillingSubscriptionSyncService', async () => {
    let billingSubscriptionSyncServiceStub: sinon.SinonStub = sinon
      .stub(BillingSubscriptionSyncService.prototype, 'addSubscriptions')
      .resolves();

    const now = new Date();
    const startDate = new Date(now.getTime() - 86400000); // 1 day ago
    const endDate = new Date(now.getTime() - 1000); // 1 second ago

    const current_period_start = Math.floor(startDate.getTime() / 1000);
    const current_period_end = Math.floor(endDate.getTime() / 1000);

    const startDateFromTimestamp = new Date(current_period_start * 1000);
    const endDateFromTimestamp = new Date(current_period_end * 1000);

    const fakeSubscription = {
      stripeId: subscriptionId,
      isActive: true,
      participantId,
      subscriptionType: 'payAmount',
      resourceId: '',
      resourceIds: [],
      details: {
        startDate: startDateFromTimestamp,
        endDate: endDateFromTimestamp,
      },
    } as unknown as Subscription;

    const mockStripeSubscription = {
      id: subscriptionId,
      status: 'active',
      customer: customerId,
      current_period_start,
      current_period_end,
    };

    await stripeService.linkParticipantToCustomer(participantId, customerId);

    stripeStub.subscriptions.retrieve
      .withArgs(subscriptionId)
      .returns(Promise.resolve(mockStripeSubscription));

    const event = {
      type: 'customer.subscription.created',
      data: {
        object: { id: subscriptionId },
      },
    } as Stripe.Event;

    await stripeService.handleWebhook(event);
    expect(billingSubscriptionSyncServiceStub.calledOnce).to.be.true;
    expect(
      billingSubscriptionSyncServiceStub.calledWithExactly([fakeSubscription]),
    ).to.be.true;
    billingSubscriptionSyncServiceStub.restore();

    const billingSyncServiceInstance =
      await BillingSubscriptionSyncService.retrieveServiceInstance();
    subscriptions = await billingSyncServiceInstance.addSubscriptions([
      fakeSubscription,
    ]);
  });

  it('should handle "customer.subscription.deleted" event and call removeSubscription from sync service', async () => {
    const removeSubscriptionStub = sinon
      .stub(BillingSubscriptionService.prototype, 'removeSubscriptionById')
      .resolves();

    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: { id: subscriptionId },
      },
    } as Stripe.Event;

    await stripeService.handleWebhook(event);
    expect(removeSubscriptionStub.calledOnce).to.be.true;
    const ids = subscriptions.map((sub) => (sub as { id: string }).id);
    expect(
      removeSubscriptionStub.calledWithExactly(ids[0]) ||
        ids.some((id) => removeSubscriptionStub.calledWithExactly(id)),
    ).to.be.true;
    removeSubscriptionStub.restore();

    await stripeService.unlinkParticipantFromCustomer(customerId);
  });
});
