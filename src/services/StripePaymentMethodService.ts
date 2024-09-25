import StripeService from './StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';
import Stripe from 'stripe';

class StripePaymentMethodService {
  private static instance: StripePaymentMethodService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripePaymentMethodService {
    if (!StripePaymentMethodService.instance) {
      StripePaymentMethodService.instance = new StripePaymentMethodService();
    }
    return StripePaymentMethodService.instance;
  }

  public async createPaymentMethod(
    params: Stripe.PaymentMethodCreateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentMethod | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentMethod = await this.stripeService.paymentMethods.create(
        params,
        options,
      );
      return paymentMethod;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating payment method: ${err.message}`,
      });
      return null;
    }
  }

  public async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentMethod | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentMethod = await this.stripeService.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId },
        options,
      );
      return paymentMethod;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error attaching payment method: ${err.message}`,
      });
      return null;
    }
  }

  public async getPaymentMethod(
    paymentMethodId: string,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentMethod | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentMethod = await this.stripeService.paymentMethods.retrieve(
        paymentMethodId,
        options,
      );
      return paymentMethod;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving payment method: ${err.message}`,
      });
      return null;
    }
  }

  public async detachPaymentMethod(
    paymentMethodId: string,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentMethod | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const paymentMethod = await this.stripeService.paymentMethods.detach(
        paymentMethodId,
        options,
      );
      return paymentMethod;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error detaching payment method: ${err.message}`,
      });
      return null;
    }
  }
}

export default StripePaymentMethodService;
