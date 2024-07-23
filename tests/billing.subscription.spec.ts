import { expect } from 'chai';
import BillingSubscriptionService from '../src/services/BillingSubscriptionService';

describe('BillingSubscriptionService', () => {
  let billingService: BillingSubscriptionService;

  beforeEach(() => {
    billingService = new BillingSubscriptionService();
    billingService.addSubscription([
      {
        _id: '_id_1',
        isActive: true,
        participantId: 'participant1',
        subscriptionType: 'subscriptionDateTime',
        resourceId: 'resource1',
        details: {
          subscriptionDateTime: new Date('2024-12-31'),
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
        },
      },
    ]);
  });

  describe('getParticipantSubscriptions', () => {
    it('should return all subscriptions for the given participant', () => {
      const result = billingService.getParticipantSubscriptions('participant1');
      expect(result).to.deep.equal([
        {
          _id: '_id_1',
          participantId: 'participant1',
          subscriptionType: 'subscriptionDateTime',
          isActive: true,
          resourceId: 'resource1',
          details: {
            subscriptionDateTime: new Date('2024-12-31'),
          },
        },
        {
          _id: '_id_2',
          participantId: 'participant1',
          subscriptionType: 'usageCount',
          isActive: true,
          resourceIds: ['resource2', 'resource3'],
          details: {
            usageCount: 10,
          },
        },
      ]);
    });

    it('should return an empty array if the participant has no subscriptions', () => {
      const result = billingService.getParticipantSubscriptions('participant4');
      expect(result).to.deep.equal([]);
    });
  });

  describe('getResourceSubscription', () => {
    it('should return the subscription for a specific resource', () => {
      const result = billingService.getResourceSubscription(
        'participant1',
        'resource1',
      );
      expect(result).to.deep.equal({
        _id: '_id_1',
        participantId: 'participant1',
        subscriptionType: 'subscriptionDateTime',
        isActive: true,
        resourceId: 'resource1',
        details: {
          subscriptionDateTime: new Date('2024-12-31'),
        },
      });
    });

    it('should return null if no subscription exists for the specific resource', () => {
      const result = billingService.getResourceSubscription(
        'participant1',
        'nonexistentResource',
      );
      expect(result).to.be.null;
    });
  });

  describe('getGroupSubscription', () => {
    it('should return the group subscription that includes the given resource', () => {
      const result = billingService.getGroupSubscription(
        'participant1',
        'resource2',
      );
      expect(result).to.deep.equal({
        _id: '_id_2',
        participantId: 'participant1',
        subscriptionType: 'usageCount',
        isActive: true,
        resourceIds: ['resource2', 'resource3'],
        details: {
          usageCount: 10,
        },
      });
    });

    it('should return null if no group subscription includes the given resource', () => {
      const result = billingService.getGroupSubscription(
        'participant1',
        'nonexistentResource',
      );
      expect(result).to.be.null;
    });
  });

  describe('getSubscriptionDateTime', () => {
    it('should return the subscription end date for a specific resource', () => {
      const result = billingService.getSubscriptionDateTime(
        'participant1',
        'resource1',
      );
      expect(result).to.deep.equal(new Date('2024-12-31'));
    });

    it('should return null if there is no subscription end date for the resource', () => {
      const result = billingService.getSubscriptionDateTime(
        'participant1',
        'resource2',
      );
      expect(result).to.be.null;
    });

    it('should return null if there is no subscription for the given resource', () => {
      const result = billingService.getSubscriptionDateTime(
        'participant1',
        'nonexistentResource',
      );
      expect(result).to.be.null;
    });
  });

  describe('getSubscriptionPayAmount', () => {
    it('should return the payment amount for a specific resource subscription', () => {
      const result = billingService.getSubscriptionPayAmount(
        'participant2',
        'resource4',
      );
      expect(result).to.equal(50);
    });

    it('should return the payment amount for a group subscription', () => {
      const result = billingService.getSubscriptionPayAmount(
        'participant2',
        'resource5',
      );
      expect(result).to.equal(100);
    });

    it('should return null if there is no payment amount for the subscription', () => {
      const result = billingService.getSubscriptionPayAmount(
        'participant1',
        'resource1',
      );
      expect(result).to.be.null;
    });

    it('should return null if there is no subscription for the given resource', () => {
      const result = billingService.getSubscriptionPayAmount(
        'participant1',
        'nonexistentResource',
      );
      expect(result).to.be.null;
    });
  });

  describe('getSubscriptionUsageCount', () => {
    it('should return the usage count for a specific resource subscription', () => {
      const result = billingService.getSubscriptionUsageCount(
        'participant3',
        'resource6',
      );
      expect(result).to.equal(5);
    });

    it('should return the usage count for a group subscription', () => {
      const result = billingService.getSubscriptionUsageCount(
        'participant1',
        'resource2',
      );
      expect(result).to.equal(10);
    });

    it('should return null if there is no usage count for the subscription', () => {
      const result = billingService.getSubscriptionUsageCount(
        'participant1',
        'resource1',
      );
      expect(result).to.be.null;
    });

    it('should return null if there is no subscription for the given resource', () => {
      const result = billingService.getSubscriptionUsageCount(
        'participant1',
        'nonexistentResource',
      );
      expect(result).to.be.null;
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return true if the subscription is active for the given participant and resource', () => {
      const result = billingService.isSubscriptionActive(
        'participant1',
        'resource1',
      );
      expect(result).to.be.true;
    });

    it('should return true if the group subscription is active for the given participant and resource', () => {
      const result = billingService.isSubscriptionActive(
        'participant1',
        'resource2',
      );
      expect(result).to.be.true;
    });

    it('should return false if the subscription is not active for the given participant and resource', () => {
      const result = billingService.isSubscriptionActive(
        'participant2',
        'resource4',
      );
      expect(result).to.be.false;
    });

    it('should return false if there is no subscription for the given participant and resource', () => {
      const result = billingService.isSubscriptionActive(
        'participant4',
        'resource1',
      );
      expect(result).to.be.false;
    });
  });
});
