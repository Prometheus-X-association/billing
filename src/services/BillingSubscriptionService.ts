type SubscriptionType = 'subscriptionDateTime' | 'payAmount' | 'usageCount';

interface SubscriptionDetail {
  subscriptionDateTime?: Date;
  payAmount?: number;
  usageCount?: number;
}

export interface Subscription {
  _id: string;
  isActive: boolean;
  participantId: string;
  subscriptionType: SubscriptionType;
  resourceId?: string;
  resourceIds?: string[];
  details: SubscriptionDetail;
}

class BillingSubscriptionService {
  private static instance: BillingSubscriptionService;
  private subscriptions: Subscription[] = [];

  public contructor() {}

  public static getService(): BillingSubscriptionService {
    if (!BillingSubscriptionService.instance) {
      BillingSubscriptionService.instance = new BillingSubscriptionService();
    }
    return BillingSubscriptionService.instance;
  }

  public addSubscription(subscriptions: Subscription[] | Subscription) {
    if (Array.isArray(subscriptions)) {
      this.subscriptions.push(...subscriptions);
    } else {
      this.subscriptions.push(subscriptions);
    }
  }

  public removeSubscriptionById(subscriptionId: string): void {
    this.subscriptions = this.subscriptions.filter(
      (sub) => sub._id !== subscriptionId,
    );
  }

  public getParticipantSubscriptions(participantId: string): Subscription[] {
    return this.subscriptions.filter(
      (sub) => sub.participantId === participantId,
    );
  }

  public getResourceSubscription(
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

  public getGroupSubscription(
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

  public getSubscriptionDateTime(
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

  public getSubscriptionPayAmount(
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

  public getSubscriptionUsageCount(
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

  public isSubscriptionActive(
    participantId: string,
    resourceId: string,
  ): boolean {
    const subscription = this.getResourceSubscription(
      participantId,
      resourceId,
    );
    return subscription ? subscription.isActive : false;
  }

  public getAllSubscriptions(): Subscription[] {
    return this.subscriptions;
  }
}

export default BillingSubscriptionService;
