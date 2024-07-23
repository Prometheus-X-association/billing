type SubscriptionType = 'subscriptionDateTime' | 'payAmount' | 'usageCount';

interface SubscriptionDetail {
  subscriptionDateTime?: Date;
  payAmount?: number;
  usageCount?: number;
}

interface Subscription {
  isActive: boolean;
  participantId: string;
  subscriptionType: SubscriptionType;
  resourceId?: string;
  resourceIds?: string[];
  details: SubscriptionDetail;
}

class BillingSubscriptionService {
  private subscriptions: Subscription[] = [
    {
      isActive: true,
      participantId: 'participant1',
      subscriptionType: 'subscriptionDateTime',
      resourceId: 'resource1',
      details: {
        subscriptionDateTime: new Date('2024-12-31'),
      },
    },
    {
      isActive: true,
      participantId: 'participant1',
      subscriptionType: 'usageCount',
      resourceIds: ['resource2', 'resource3'],
      details: {
        usageCount: 10,
      },
    },
    {
      isActive: false,
      participantId: 'participant2',
      subscriptionType: 'payAmount',
      resourceId: 'resource4',
      details: {
        payAmount: 50,
      },
    },
    {
      isActive: true,
      participantId: 'participant2',
      subscriptionType: 'payAmount',
      resourceIds: ['resource5', 'resource6'],
      details: {
        payAmount: 100,
      },
    },
    {
      isActive: true,
      participantId: 'participant3',
      subscriptionType: 'usageCount',
      resourceId: 'resource6',
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

  getResourceSubscription(
    participantId: string,
    resourceId: string,
  ): Subscription | null {
    return (
      this.subscriptions.find(
        (sub) =>
          sub.participantId === participantId &&
          (sub.resourceId === resourceId ||
            (sub.resourceIds && sub.resourceIds.includes(resourceId))),
      ) || null
    );
  }

  getGroupSubscription(
    participantId: string,
    resourceId: string,
  ): Subscription | null {
    return (
      this.subscriptions.find(
        (sub) =>
          sub.participantId === participantId &&
          sub.resourceIds &&
          sub.resourceIds.includes(resourceId),
      ) || null
    );
  }

  getSubscriptionDateTime(
    participantId: string,
    resourceId: string,
  ): Date | null {
    const subscription = this.getResourceSubscription(
      participantId,
      resourceId,
    );
    return subscription &&
      subscription.subscriptionType === 'subscriptionDateTime'
      ? (subscription.details.subscriptionDateTime ?? null)
      : null;
  }

  getSubscriptionPayAmount(
    participantId: string,
    resourceId: string,
  ): number | null {
    const subscription = this.getResourceSubscription(
      participantId,
      resourceId,
    );
    return subscription && subscription.subscriptionType === 'payAmount'
      ? (subscription.details.payAmount ?? null)
      : null;
  }

  getSubscriptionUsageCount(
    participantId: string,
    resourceId: string,
  ): number | null {
    const subscription = this.getResourceSubscription(
      participantId,
      resourceId,
    );
    return subscription && subscription.subscriptionType === 'usageCount'
      ? (subscription.details.usageCount ?? null)
      : null;
  }

  isSubscriptionActive(participantId: string, resourceId: string): boolean {
    const subscription = this.getResourceSubscription(
      participantId,
      resourceId,
    );
    return subscription ? subscription.isActive : false;
  }
}

export default BillingSubscriptionService;
