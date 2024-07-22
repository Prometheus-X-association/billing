import { expect } from 'chai';
import BillingSubscriptionService from '../src/services/BillingSubscriptionService';

describe('BillingSubscriptionService', () => {
  let billingService: BillingSubscriptionService;

  beforeEach(() => {
    billingService = new BillingSubscriptionService();
  });

  describe('getParticipantSubscriptions', () => {
    it('should return all subscriptions for the given participant', () => {
      const result = billingService.getParticipantSubscriptions('participant1');
      expect(
        result,
        'Subscriptions do not match expected result',
      ).to.deep.equal([
        {
          participantId: 'participant1',
          subscriptionType: 'subscriptionDateTime',
          isActive: true,
          details: {
            subscriptionDateTime: new Date('2024-12-31'),
          },
        },
      ]);
    });

    it('should return an empty array if the participant has no subscriptions', () => {
      const result = billingService.getParticipantSubscriptions('participant4');
      expect(result, 'Result should be an empty array').to.deep.equal([]);
    });
  });

  describe('getSubscriptionDateTime', () => {
    it('should return the subscription end date if it exists', () => {
      const result = billingService.getSubscriptionDateTime('participant1');
      expect(result, 'Subscription end date does not match').to.deep.equal(
        new Date('2024-12-31'),
      );
    });

    it('should return null if there is no subscription end date', () => {
      const result = billingService.getSubscriptionDateTime('participant4');
      expect(result, 'Result should be null').to.be.null;
    });
  });

  describe('getSubscriptionPayAmount', () => {
    it('should return the payment amount if it exists', () => {
      const result = billingService.getSubscriptionPayAmount('participant2');
      expect(result, 'Payment amount does not match').to.equal(50);
    });

    it('should return null if there is no payment amount', () => {
      const result = billingService.getSubscriptionPayAmount('participant4');
      expect(result, 'Result should be null').to.be.null;
    });
  });

  describe('getSubscriptionUsageCount', () => {
    it('should return the usage count if it exists', () => {
      const result = billingService.getSubscriptionUsageCount('participant3');
      expect(result, 'Usage count does not match').to.equal(5);
    });

    it('should return null if there is no usage count', () => {
      const result = billingService.getSubscriptionUsageCount('participant4');
      expect(result, 'Result should be null').to.be.null;
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return true if the subscription is active for the given participant', () => {
      const result = billingService.isSubscriptionActive('participant1');
      expect(result, 'Subscription should be active').to.be.true;
    });

    it('should return false if the subscription is not active for the given participant', () => {
      const result = billingService.isSubscriptionActive('participant2');
      expect(result, 'Subscription should not be active').to.be.false;
    });

    it('should return false if there is no subscription for the given participant', () => {
      const result = billingService.isSubscriptionActive('participant4');
      expect(result, 'Result should be false for non-existent subscription').to
        .be.false;
    });
  });
});
