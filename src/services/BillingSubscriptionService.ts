interface SubscriptionDetail {
  subscriptionDateTime?: Date;
  payAmount?: number;
  usageCount?: number;
}

interface Subscription {
  participantId: string;
  subscriptionType: 'subscriptionDateTime' | 'payAmount' | 'usageCount';
  isActive: boolean;
  details: SubscriptionDetail;
}

class BillingSubscriptionService {
  private subscriptions: Subscription[] = [
    {
      participantId: 'participant1',
      subscriptionType: 'subscriptionDateTime',
      isActive: true,
      details: {
        subscriptionDateTime: new Date('2024-12-31'),
      },
    },
    {
      participantId: 'participant2',
      subscriptionType: 'payAmount',
      isActive: false,
      details: {
        payAmount: 50,
      },
    },
    {
      participantId: 'participant3',
      subscriptionType: 'usageCount',
      isActive: true,
      details: {
        usageCount: 5,
      },
    },
  ];

  getParticipantSubscriptions(participantId: string): Subscription[] {
    return this.subscriptions.filter(
      (sub) => sub.participantId === participantId,
    );
  }

  getSubscriptionDateTime(participantId: string): Date | null {
    const subscription = this.subscriptions.find(
      (sub) =>
        sub.participantId === participantId &&
        sub.subscriptionType === 'subscriptionDateTime',
    );
    return subscription
      ? (subscription.details.subscriptionDateTime ?? null)
      : null;
  }

  getSubscriptionPayAmount(participantId: string): number | null {
    const subscription = this.subscriptions.find(
      (sub) =>
        sub.participantId === participantId &&
        sub.subscriptionType === 'payAmount',
    );
    return subscription ? (subscription.details.payAmount ?? null) : null;
  }

  getSubscriptionUsageCount(participantId: string): number | null {
    const subscription = this.subscriptions.find(
      (sub) =>
        sub.participantId === participantId &&
        sub.subscriptionType === 'usageCount',
    );
    return subscription ? (subscription.details.usageCount ?? null) : null;
  }

  isSubscriptionActive(participantId: string): boolean {
    const subscription = this.subscriptions.find(
      (sub) => sub.participantId === participantId,
    );
    return subscription ? subscription.isActive : false;
  }
}

export default BillingSubscriptionService;
