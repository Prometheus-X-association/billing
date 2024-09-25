import StripeService from './StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';
import Stripe from 'stripe';

class StripeSetupIntentService {
  private static instance: StripeSetupIntentService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripeSetupIntentService {
    if (!StripeSetupIntentService.instance) {
      StripeSetupIntentService.instance = new StripeSetupIntentService();
    }
    return StripeSetupIntentService.instance;
  }

  public async createSetupIntent(
    params: Stripe.SetupIntentCreateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.SetupIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const setupIntent = await this.stripeService.setupIntents.create(
        params,
        options,
      );
      return setupIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating setup intent: ${err.message}`,
      });
      return null;
    }
  }

  public async updateSetupIntent(
    setupIntentId: string,
    params: Stripe.SetupIntentUpdateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.SetupIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const setupIntent = await this.stripeService.setupIntents.update(
        setupIntentId,
        params,
        options,
      );
      return setupIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error updating setup intent: ${err.message}`,
      });
      return null;
    }
  }

  public async getSetupIntent(
    setupIntentId: string,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.SetupIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const setupIntent = await this.stripeService.setupIntents.retrieve(
        setupIntentId,
        options,
      );
      return setupIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving setup intent: ${err.message}`,
      });
      return null;
    }
  }

  public async cancelSetupIntent(
    setupIntentId: string,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.SetupIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const setupIntent = await this.stripeService.setupIntents.cancel(
        setupIntentId,
        options,
      );
      return setupIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error canceling setup intent: ${err.message}`,
      });
      return null;
    }
  }

  public async confirmSetupIntent(
    setupIntentId: string,
    params: Stripe.SetupIntentConfirmParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.SetupIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const setupIntent = await this.stripeService.setupIntents.confirm(
        setupIntentId,
        params,
        options,
      );
      return setupIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error confirming setup intent: ${err.message}`,
      });
      return null;
    }
  }
}

export default StripeSetupIntentService;
