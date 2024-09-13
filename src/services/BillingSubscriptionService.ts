import { Subscription } from '../types/billing.subscription.types';

class BillingSubscriptionService {
  private static instance: BillingSubscriptionService;
  private subscriptions: Subscription[] = [];

  public contructor() {}

  public static retrieveServiceInstance(): BillingSubscriptionService {
    if (!BillingSubscriptionService.instance) {
      BillingSubscriptionService.instance = new BillingSubscriptionService();
    }
    return BillingSubscriptionService.instance;
  }

  public clean() {
    this.subscriptions = [];
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

  /**
   * Returns all subscriptions for a resource of a given participant.
   *
   * @param participantId - The Id of the participant.
   * @param resourceId - The Id of the resource.
   * @returns An array of subscriptions that match the participant and resource.
   */
  public getParticipantResourceSubscriptions(
    participantId: string,
    resourceId: string,
  ): Subscription[] {
    return this.subscriptions.filter(
      (sub) =>
        sub.participantId === participantId &&
        (sub.resourceId === resourceId ||
          (sub.resourceIds && sub.resourceIds.includes(resourceId))),
    );
  }

  /**
   * Returns all 'limitDate' subscriptions for a resource of a given participant.
   *
   * @param participantId - The Id of the participant.
   * @param resourceId - The Id of the resource.
   * @returns An array of 'limitDate' subscriptions that match the participant and resource.
   */
  public getLimitDateSubscriptions(
    participantId: string,
    resourceId: string,
  ): Subscription[] {
    const subscriptions = this.getParticipantResourceSubscriptions(
      participantId,
      resourceId,
    );
    return subscriptions.filter((sub) => sub.subscriptionType === 'limitDate');
  }

  /**
   * Returns all PayAmount subscriptions for a resource of a given participant.
   *
   * @param participantId - The Id of the participant.
   * @param resourceId - The Id of the resource.
   * @returns An array of 'payAmount' subscriptions that match the participant and resource.
   */
  public getPayAmountSubscriptions(
    participantId: string,
    resourceId: string,
  ): Subscription[] {
    const subscriptions = this.getParticipantResourceSubscriptions(
      participantId,
      resourceId,
    );
    return subscriptions.filter((sub) => sub.subscriptionType === 'payAmount');
  }

  /**
   * Returns all UsageCount subscriptions for a resource of a given participant.
   *
   * @param participantId - The Id of the participant.
   * @param resourceId - The Id of the resource.
   * @returns An array of 'usageCount' subscriptions that match the participant and resource.
   */
  public getUsageCountSubscriptions(
    participantId: string,
    resourceId: string,
  ): Subscription[] {
    const subscriptions = this.getParticipantResourceSubscriptions(
      participantId,
      resourceId,
    );
    return subscriptions.filter((sub) => sub.subscriptionType === 'usageCount');
  }

  /**
   * Returns the last active usage count for a given participant and resource.
   * This method filters active 'usageCount' subscriptions, selects those that are still valid
   * (count > 0 and endDate in the future), and returns the one with the lowest usage count.
   *
   * @param participantId - The ID of the participant.
   * @param resourceId - The ID of the resource.
   * @returns An object containing the subscription ID and the usage count,
   *          or `undefined` if no valid active subscription is found.
   */
  public getLastActiveUsageCount(
    participantId: string,
    resourceId: string,
  ): { subscriptionId: string; usageCount: number } | undefined {
    const now = new Date();
    const activeSubscriptions = this.getUsageCountSubscriptions(
      participantId,
      resourceId,
    )
      .filter(
        (sub) =>
          sub.isActive &&
          sub.details.endDate > now &&
          (sub.details.usageCount ?? 0) > 0,
      )
      .sort(
        (a, b) => (a.details.usageCount ?? 0) - (b.details.usageCount ?? 0),
      );

    if (activeSubscriptions.length > 0) {
      const subscription = activeSubscriptions[0];
      if (subscription._id) {
        return {
          subscriptionId: subscription._id,
          usageCount: subscription.details.usageCount ?? 0,
        };
      }
    }
    return undefined;
  }

  /**
   * Returns the last active pay amount for a given participant and resource.
   * This method filters active 'payAmount' subscriptions, selects those that are still valid
   * (payAmount > 0 and endDate in the future), and returns the one with the lowest pay amount.
   *
   * @param participantId - The ID of the participant.
   * @param resourceId - The ID of the resource.
   * @returns An object containing the subscription ID and the pay amount,
   *          or `undefined` if no valid active subscription is found.
   */
  public getLastActivePayAmount(
    participantId: string,
    resourceId: string,
  ): { subscriptionId: string; payAmount: number } | undefined {
    const now = new Date();
    const activeSubscriptions = this.getPayAmountSubscriptions(
      participantId,
      resourceId,
    )
      .filter(
        (sub) =>
          sub.isActive &&
          sub.details.endDate > now &&
          (sub.details.payAmount ?? 0) > 0,
      )
      .sort((a, b) => (a.details.payAmount ?? 0) - (b.details.payAmount ?? 0));

    if (activeSubscriptions.length > 0) {
      const subscription = activeSubscriptions[0];
      if (subscription._id) {
        return {
          subscriptionId: subscription._id,
          payAmount: subscription.details.payAmount ?? 0,
        };
      }
    }
    return undefined;
  }

  /**
   * Returns the last active limit date for a given participant and resource.
   * This method filters active 'limitDate' subscriptions, selects those that are still valid
   * (limitDate in the future and endDate in the future), and returns the one with the closest limit date.
   *
   * @param participantId - The ID of the participant.
   * @param resourceId - The ID of the resource.
   * @returns An object containing the subscription ID and the limit date,
   *          or `undefined` if no valid active subscription is found.
   */
  public getLastActiveLimitDate(
    participantId: string,
    resourceId: string,
  ): { subscriptionId: string; limitDate: Date } | undefined {
    const now = new Date();
    const activeSubscriptions = this.getLimitDateSubscriptions(
      participantId,
      resourceId,
    )
      .filter(
        (sub) =>
          sub.isActive &&
          sub.details.endDate > now &&
          sub.details.limitDate &&
          sub.details.limitDate > now,
      )
      .sort(
        (a, b) =>
          (a.details.limitDate?.getTime() ?? 0) -
          (b.details.limitDate?.getTime() ?? 0),
      );

    if (activeSubscriptions.length > 0) {
      const subscription = activeSubscriptions[0];
      if (subscription._id) {
        return {
          subscriptionId: subscription._id,
          limitDate: subscription.details.limitDate!,
        };
      }
    }
    return undefined;
  }

  /**
   * Returns all active 'usageCount' subscriptions for a given participant and resource.
   * This method filters active 'usageCount' subscriptions and selects those that are still valid
   * (endDate in the future and usageCount greater than 0).
   *
   * @param participantId - The ID of the participant.
   * @param resourceId - The ID of the resource.
   * @returns An array of objects containing the subscription ID and the remaining usage count,
   *          or an empty array if no valid active subscriptions are found.
   */
  public getValidActiveUsageCountSubscriptions(
    participantId: string,
    resourceId: string,
  ): Array<{ subscriptionId: string; usageCount: number }> {
    const now = new Date();
    const activeSubscriptions = this.getUsageCountSubscriptions(
      participantId,
      resourceId,
    ).filter(
      (sub) =>
        sub.isActive &&
        sub.details.endDate > now &&
        (sub.details.usageCount ?? 0) > 0,
    );
    return activeSubscriptions
      .filter((sub) => sub._id != null)
      .map((sub) => ({
        subscriptionId: sub._id!.toString(),
        usageCount: sub.details.usageCount ?? 0,
      }));
  }

  /**
   * Returns all active pay amount subscriptions for a given participant and resource.
   * This method filters active 'payAmount' subscriptions and selects those that are still valid
   * (payAmount > 0 and endDate in the future).
   *
   * @param participantId - The ID of the participant.
   * @param resourceId - The ID of the resource.
   * @returns An array of objects containing the subscription ID and the pay amount,
   *          or an empty array if no valid active subscriptions are found.
   */
  public getValidActivePayAmountSubscriptions(
    participantId: string,
    resourceId: string,
  ): Array<{ subscriptionId: string; payAmount: number }> {
    const now = new Date();
    const activeSubscriptions = this.getPayAmountSubscriptions(
      participantId,
      resourceId,
    ).filter(
      (sub) =>
        sub.isActive &&
        sub.details.endDate > now &&
        (sub.details.payAmount ?? 0) > 0,
    );
    return activeSubscriptions
      .filter((sub) => sub._id != null)
      .map((sub) => ({
        subscriptionId: sub._id!.toString(),
        payAmount: sub.details.payAmount ?? 0,
      }));
  }

  /**
   * Returns all active 'limitDate' subscriptions for a given participant and resource.
   * This method filters active 'limitDate' subscriptions and selects those that are still valid
   * (limitDate in the future).
   *
   * @param participantId - The ID of the participant.
   * @param resourceId - The ID of the resource.
   * @returns An array of objects containing the subscription ID and the limit date,
   *          or an empty array if no valid active subscriptions are found.
   */
  public getValidActiveLimitDateSubscriptions(
    participantId: string,
    resourceId: string,
  ): Array<{ subscriptionId: string; limitDate: number }> {
    const now = new Date();
    const activeSubscriptions = this.getLimitDateSubscriptions(
      participantId,
      resourceId,
    ).filter(
      (sub) =>
        sub.isActive && sub.details.limitDate && sub.details.limitDate > now,
    );
    return activeSubscriptions
      .filter((sub) => sub._id != null)
      .map((sub) => ({
        subscriptionId: sub._id!.toString(),
        limitDate: sub.details.limitDate?.getTime() ?? 0,
      }));
  }

  /**
   * Checks if there is an active subscription for a resource of a given participant.
   *
   * @param participantId - The Id of the participant.
   * @param resourceId - The Id of the resource.
   * @returns True if there is at least one active subscription, false otherwise.
   */
  public hasActiveSubscriptionFor(
    participantId: string,
    resourceId: string,
  ): boolean {
    const subscriptions = this.getParticipantResourceSubscriptions(
      participantId,
      resourceId,
    );
    return subscriptions.some((sub) => sub.isActive);
  }

  /**
   * Returns all subscriptions.
   *
   * @returns An array of all subscriptions.
   */
  public getAllSubscriptions(): Subscription[] {
    return this.subscriptions;
  }

  /**
   * Returns all subscriptions.
   *
   * @returns An array of all subscriptions.
   */
  public getAllActiveSubscriptions(): Subscription[] {
    return this.subscriptions.filter((sub) => sub.isActive);
  }
}

export default BillingSubscriptionService;
