import StripeService from './StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';
import Stripe from 'stripe';

class StripeSubscriptionCrudService {
  private static instance: StripeSubscriptionCrudService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripeSubscriptionCrudService {
    if (!StripeSubscriptionCrudService.instance) {
      StripeSubscriptionCrudService.instance =
        new StripeSubscriptionCrudService();
    }
    return StripeSubscriptionCrudService.instance;
  }

  public async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Subscription | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const subscription = await this.stripeService.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });
      return subscription;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating subscription: ${err.message}`,
      });
      return null;
    }
  }

  public async getSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const subscription =
        await this.stripeService.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving subscription: ${err.message}`,
      });
      return null;
    }
  }

  public async updateSubscription(
    subscriptionId: string,
    updates: Stripe.SubscriptionUpdateParams,
  ): Promise<Stripe.Subscription | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const updatedSubscription = await this.stripeService.subscriptions.update(
        subscriptionId,
        updates,
      );
      return updatedSubscription;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error updating subscription: ${err.message}`,
      });
      return null;
    }
  }

  public async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const canceledSubscription =
        await this.stripeService.subscriptions.cancel(subscriptionId);
      return canceledSubscription;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error canceling subscription: ${err.message}`,
      });
      return null;
    }
  }
}

export default StripeSubscriptionCrudService;
