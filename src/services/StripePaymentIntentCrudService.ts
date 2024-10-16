import StripeService from './StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';
import Stripe from 'stripe';

class StripePaymentIntentCrudService {
  private static instance: StripePaymentIntentCrudService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripePaymentIntentCrudService {
    if (!StripePaymentIntentCrudService.instance) {
      StripePaymentIntentCrudService.instance =
        new StripePaymentIntentCrudService();
    }
    return StripePaymentIntentCrudService.instance;
  }

  public async createPaymentIntent(
    params: Stripe.PaymentIntentCreateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentIntent = await this.stripeService.paymentIntents.create(
        params,
        options,
      );
      return paymentIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating payment intent: ${err.message}`,
      });
      return null;
    }
  }

  public async updatePaymentIntent(
    paymentIntentId: string,
    params: Stripe.PaymentIntentUpdateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentIntent = await this.stripeService.paymentIntents.update(
        paymentIntentId,
        params,
        options,
      );
      return paymentIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error updating payment intent: ${err.message}`,
      });
      return null;
    }
  }

  public async getPaymentIntent(
    paymentIntentId: string,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentIntent = await this.stripeService.paymentIntents.retrieve(
        paymentIntentId,
        options,
      );
      return paymentIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving payment intent: ${err.message}`,
      });
      return null;
    }
  }

  public async confirmPaymentIntent(
    paymentIntentId: string,
    params?: Stripe.PaymentIntentConfirmParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentIntent = await this.stripeService.paymentIntents.confirm(
        paymentIntentId,
        params,
        options,
      );
      return paymentIntent;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error confirming payment intent: ${err.message}`,
      });
      return null;
    }
  }
}

export default StripePaymentIntentCrudService;
