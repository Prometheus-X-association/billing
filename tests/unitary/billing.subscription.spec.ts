import { expect } from 'chai';
import BillingSubscriptionService from '../../src/services/BillingSubscriptionService';
import { Subscription } from '../../src/types/billing.subscription.types';

describe('Billing Subscription Service', () => {
  let billingService: BillingSubscriptionService;

  before(() => {
    billingService = BillingSubscriptionService.retrieveServiceInstance();
    const now = new Date();
    const startDate = new Date(now.getTime() - 86400000); // 1 day in the past
    const futureDate = new Date(now.getTime() + 86400000); // 1 day in the future
    const farFutureDate = new Date(now.getTime() + 172800000); // 2 days in the future

    const subscriptions: Subscription[] = [
      {
        _id: '_id_1',
        isActive: true,
        participantId: 'participant1',
        subscriptionType: 'limitDate',
        resourceId: 'resource1',
        details: {
          limitDate: futureDate,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: '_id_2',
        isActive: true,
        participantId: 'participant1',
        subscriptionType: 'usageCount',
        resourceIds: ['resource2', 'resource3'],
        details: {
          usageCount: 10,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: '_id_3',
        isActive: false,
        participantId: 'participant2',
        subscriptionType: 'payAmount',
        resourceId: 'resource4',
        details: {
          payAmount: 50,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: '_id_4',
        isActive: true,
        participantId: 'participant2',
        subscriptionType: 'payAmount',
        resourceIds: ['resource5', 'resource6'],
        details: {
          payAmount: 100,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: '_id_5',
        isActive: true,
        participantId: 'participant3',
        subscriptionType: 'usageCount',
        resourceId: 'resource6',
        details: {
          usageCount: 5,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: 'usage_1',
        isActive: true,
        participantId: 'participant1',
        subscriptionType: 'usageCount',
        resourceId: 'resource1',
        details: {
          usageCount: 5,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: 'usage_2',
        isActive: true,
        participantId: 'participant1',
        subscriptionType: 'usageCount',
        resourceId: 'resource1',
        details: {
          usageCount: 3,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: 'pay_1',
        isActive: true,
        participantId: 'participant2',
        subscriptionType: 'payAmount',
        resourceId: 'resource2',
        details: {
          payAmount: 100,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: 'pay_2',
        isActive: true,
        participantId: 'participant2',
        subscriptionType: 'payAmount',
        resourceId: 'resource2',
        details: {
          payAmount: 50,
          startDate: startDate,
          endDate: futureDate,
        },
      },
      {
        _id: 'limit_1',
        isActive: true,
        participantId: 'participant3',
        subscriptionType: 'limitDate',
        resourceId: 'resource3',
        details: {
          limitDate: farFutureDate,
          startDate: startDate,
          endDate: farFutureDate,
        },
      },
      {
        _id: 'limit_2',
        isActive: true,
        participantId: 'participant3',
        subscriptionType: 'limitDate',
        resourceId: 'resource3',
        details: {
          limitDate: futureDate,
          startDate: startDate,
          endDate: farFutureDate,
        },
      },
    ];

    billingService.addSubscription(subscriptions);
  });

  describe('getParticipantSubscriptions', () => {
    it('should return all subscriptions for the given participant', () => {
      const result = billingService.getParticipantSubscriptions('participant1');
      expect(result).to.have.lengthOf(4);
      expect(result.map((sub) => sub._id)).to.include.members([
        '_id_1',
        '_id_2',
        'usage_1',
        'usage_2',
      ]);
    });

    it('should return an empty array if the participant has no subscriptions', () => {
      const result = billingService.getParticipantSubscriptions('participant4');
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getParticipantResourceSubscriptions', () => {
    it('should return the subscriptions for a specific resource', () => {
      const result = billingService.getParticipantResourceSubscriptions(
        'participant1',
        'resource1',
      );
      expect(result).to.have.lengthOf(3);
      expect(result.map((sub) => sub._id)).to.include.members([
        '_id_1',
        'usage_1',
        'usage_2',
      ]);
    });

    it('should return subscriptions for a resource in a group subscription', () => {
      const result = billingService.getParticipantResourceSubscriptions(
        'participant1',
        'resource2',
      );
      expect(result).to.have.lengthOf(1);
      expect(result[0]._id).to.equal('_id_2');
    });

    it('should return an empty array if no subscription exists for the specific resource', () => {
      const result = billingService.getParticipantResourceSubscriptions(
        'participant1',
        'nonexistentResource',
      );
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getLimitDateSubscriptions', () => {
    it('should return the limit date subscriptions for a specific resource', () => {
      const result = billingService.getLimitDateSubscriptions(
        'participant1',
        'resource1',
      );
      expect(result).to.have.lengthOf(1);
      expect(result[0]._id).to.equal('_id_1');
      expect(result[0].subscriptionType).to.equal('limitDate');
    });

    it('should return an empty array if no limit date subscription exists', () => {
      const result = billingService.getLimitDateSubscriptions(
        'participant1',
        'resource2',
      );
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getPayAmountSubscriptions', () => {
    it('should return the pay amount subscriptions for a specific resource', () => {
      const result = billingService.getPayAmountSubscriptions(
        'participant2',
        'resource2',
      );
      expect(result).to.have.lengthOf(2);
      expect(result.map((sub) => sub._id)).to.include.members([
        'pay_1',
        'pay_2',
      ]);
      expect(result[0].subscriptionType).to.equal('payAmount');
    });

    it('should return an empty array if no pay amount subscription exists', () => {
      const result = billingService.getPayAmountSubscriptions(
        'participant1',
        'resource1',
      );
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getUsageCountSubscriptions', () => {
    it('should return the usage count subscriptions for a specific resource', () => {
      const result = billingService.getUsageCountSubscriptions(
        'participant1',
        'resource1',
      );
      expect(result).to.have.lengthOf(2);
      expect(result.map((sub) => sub._id)).to.include.members([
        'usage_1',
        'usage_2',
      ]);
      expect(result[0].subscriptionType).to.equal('usageCount');
    });

    it('should return an empty array if no usage count subscription exists', () => {
      const result = billingService.getUsageCountSubscriptions(
        'participant2',
        'resource4',
      );
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('hasActiveSubscriptionFor', () => {
    it('should return true if there is an active subscription for the given participant and resource', () => {
      const result = billingService.hasActiveSubscriptionFor(
        'participant1',
        'resource1',
      );
      expect(result).to.be.true;
    });

    it('should return true if there is an active group subscription for the given participant and resource', () => {
      const result = billingService.hasActiveSubscriptionFor(
        'participant1',
        'resource2',
      );
      expect(result).to.be.true;
    });

    it('should return false if there is no active subscription for the given participant and resource', () => {
      const result = billingService.hasActiveSubscriptionFor(
        'participant2',
        'resource4',
      );
      expect(result).to.be.false;
    });

    it('should return false if there is no subscription for the given participant and resource', () => {
      const result = billingService.hasActiveSubscriptionFor(
        'participant4',
        'resource1',
      );
      expect(result).to.be.false;
    });
  });

  describe('getLastActiveUsageCount', () => {
    it('should return the subscription with the lowest non-zero usage count', () => {
      const result = billingService.getLastActiveUsageCount(
        'participant1',
        'resource1',
      );
      expect(result).to.deep.equal({
        subscriptionId: 'usage_2',
        usageCount: 3,
      });
    });

    it('should return undefined if no active subscription with non-zero usage count exists', () => {
      billingService.removeSubscriptionById('usage_1');
      billingService.removeSubscriptionById('usage_2');
      const result = billingService.getLastActiveUsageCount(
        'participant1',
        'resource1',
      );
      expect(result).to.be.undefined;
    });

    it('should return undefined for a non-existent participant or resource', () => {
      const result = billingService.getLastActiveUsageCount(
        'nonexistent',
        'resource1',
      );
      expect(result).to.be.undefined;
    });
  });

  describe('getLastActivePayAmount', () => {
    it('should return the subscription with the lowest non-zero pay amount', () => {
      const result = billingService.getLastActivePayAmount(
        'participant2',
        'resource2',
      );
      expect(result).to.deep.equal({ subscriptionId: 'pay_2', payAmount: 50 });
    });

    it('should return undefined if no active subscription with non-zero pay amount exists', () => {
      billingService.removeSubscriptionById('pay_1');
      billingService.removeSubscriptionById('pay_2');
      const result = billingService.getLastActivePayAmount(
        'participant2',
        'resource2',
      );
      expect(result).to.be.undefined;
    });

    it('should return undefined for a non-existent participant or resource', () => {
      const result = billingService.getLastActivePayAmount(
        'nonexistent',
        'resource2',
      );
      expect(result).to.be.undefined;
    });
  });

  describe('getLastActiveLimitDate', () => {
    it('should return the subscription with the closest future limit date', () => {
      const result = billingService.getLastActiveLimitDate(
        'participant3',
        'resource3',
      );
      expect(result?.subscriptionId).to.equal('limit_2');
      expect(result?.limitDate).to.be.instanceOf(Date);
      expect(result?.limitDate.getTime()).to.be.closeTo(
        new Date().getTime() + 86400000,
        1000, // Allow 1 second tolerance
      );
    });

    it('should return undefined if no active subscription with a future limit date exists', () => {
      billingService.removeSubscriptionById('limit_1');
      billingService.removeSubscriptionById('limit_2');
      const result = billingService.getLastActiveLimitDate(
        'participant3',
        'resource3',
      );
      expect(result).to.be.undefined;
    });

    it('should return undefined for a non-existent participant or resource', () => {
      const result = billingService.getLastActiveLimitDate(
        'nonexistent',
        'resource3',
      );
      expect(result).to.be.undefined;
    });
  });
});
