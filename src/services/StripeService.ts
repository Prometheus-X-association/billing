import Stripe from 'stripe';
import { config } from '../config/environment';
import { Logger } from '../libs/Logger';

class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;

  private constructor() {
    try {
      if (config.stripeSecretKey) {
        this.stripe = new Stripe(config.stripeSecretKey);
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
}

export default StripeService;
