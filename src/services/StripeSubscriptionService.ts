import Stripe from 'stripe';
import { config } from '../config/environment';
import { Logger } from '../libs/Logger';
import {
  Subscription,
  SubscriptionDetail,
} from '../types/billing.subscription.types';

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

  public static getInstance(): StripeService {
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
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
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

  private async registerSubscription(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const formattedSubscription = await this.getAndFormatSubscription(
      subscription.id,
    );
    if (formattedSubscription) {
      // Todo: use sync service to register subscription
    }
  }

  public async getSubscription(
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

  public async getAndFormatSubscription(
    subscriptionId: string,
  ): Promise<Subscription | null> {
    const subscription: Stripe.Subscription | null =
      await this.getSubscription(subscriptionId);
    if (subscription) {
      const isActive = subscription.status === 'active';
      const participantId = await this.getParticipantId(subscription.customer);
      const subscriptionType = 'payAmount'; // Todo
      return {
        _id: '',
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
