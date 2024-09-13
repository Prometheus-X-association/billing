import Stripe from 'stripe';
import { config } from '../config/environment';
import { Logger } from '../libs/Logger';
import {
  Subscription,
  SubscriptionDetail,
  SubscriptionType,
} from '../types/billing.subscription.types';
import BillingSubscriptionSyncService from './BillingSubscriptionSyncService';
import SubscriptionModel from '../models/SubscriptionModel';

class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;

  private constructor() {
    try {
      if (config.stripeSecretKey) {
        this.stripe = this.getNewStripe(config.stripeSecretKey);
      } else {
        throw new Error('Stripe secret key is not set in configuration.');
      }
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error during Stripe service initialization: ${err.message}`,
      });
    }
  }

  public getStripe() {
    return this.stripe;
  }

  protected getNewStripe(secret: string): Stripe {
    return new Stripe(secret);
  }

  public static retrieveServiceInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  public async connect(email: string): Promise<Stripe.Customer | null> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe instance is not initialized.');
      }

      const params: Stripe.CustomerCreateParams = {
        email,
      };
      const customer = await this.stripe.customers.create(params);
      return customer;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating Stripe customer: ${err.message}`,
      });
      return null;
    }
  }

  public async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe instance is not initialized.');
      }
      const subscription = event.data.object as Stripe.Subscription;
      switch (event.type) {
        case 'customer.subscription.updated':
          // Todo
          break;
        case 'customer.subscription.deleted':
          await this.unregisterSubscription(subscription);
          break;
        case 'customer.subscription.created':
          await this.registerSubscription(subscription);
          break;
        default:
          Logger.log({ message: `Unhandled event type ${event.type}` });
      }
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error handling Stripe webhook: ${err.message}`,
      });
    }
  }

  private async unregisterSubscription(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const billingSubscription = await SubscriptionModel.findOne(
        { stripeId: subscription.id },
        { _id: 1 },
      );
      if (!billingSubscription) {
        throw new Error(
          `Subscription with stripeId ${subscription.id} not found in the database.`,
        );
      }
      const subscriptionId = billingSubscription._id.toString();
      if (subscriptionId) {
        const sync =
          await BillingSubscriptionSyncService.retrieveServiceInstance();
        await sync.removeSubscription(subscriptionId);
      } else {
        throw new Error(
          "Can't unregister subscription: Subscription ID is missing or invalid.",
        );
      }
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error unregistering subscription ${subscription.id}: ${err.message}`,
      });
    }
  }

  private async registerSubscription(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const formattedSubs: Subscription[] = [];
      const formattedSub: Subscription | null =
        await this.formatStripeSubscription(subscription.id);

      if (formattedSub) {
        formattedSubs.push(formattedSub);
        const sync =
          await BillingSubscriptionSyncService.retrieveServiceInstance();
        await sync.addSubscriptions(formattedSubs);
      } else {
        throw new Error(
          "Can't register subscription: Subscription not found or invalid.",
        );
      }
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error registering subscription ${subscription.id}: ${err.message}`,
      });
    }
  }

  public async getStripeSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription | null> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe instance is not initialized.');
      }
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving Stripe subscription: ${err.message}`,
      });
      return null;
    }
  }

  private async getRelatedParticipantId(customerId: string): Promise<string> {
    // Todo: get corresponding participant Id
    return customerId; // Tmp
  }
  private async getParticipantId(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer,
  ): Promise<string> {
    let customerId: string | null = null;
    if (typeof customer === 'string') {
      customerId = customer;
    } else if ('deleted' in customer && customer.deleted === true) {
      throw new Error('Customer has been deleted');
    } else if ('id' in customer) {
      customerId = customer.id;
    }
    if (customerId) {
      return await this.getRelatedParticipantId(customerId);
    }
    throw new Error('Unable to retrieve customer ID');
  }

  private getBillingType(subscription: Stripe.Subscription): SubscriptionType {
    // Todo: get/build the corresponding billing type
    return 'payAmount'; // Tmp
  }

  public async formatStripeSubscription(
    subscriptionId: string,
  ): Promise<Subscription | null> {
    const subscription: Stripe.Subscription | null =
      await this.getStripeSubscription(subscriptionId);
    if (subscription) {
      const isActive = subscription.status === 'active';
      const participantId = await this.getParticipantId(subscription.customer);
      const subscriptionType = this.getBillingType(subscription);
      const stripeId = subscription.id;
      return {
        stripeId,
        isActive,
        participantId,
        subscriptionType,
        resourceId: '', // Todo
        resourceIds: [], // Todo
        details: {} as SubscriptionDetail, // Todo
      };
    }
    return null;
  }
}

export default StripeService;
