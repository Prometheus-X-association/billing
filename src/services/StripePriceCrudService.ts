import StripeService from './StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';
import Stripe from 'stripe';

class StripePriceCrudService {
  private static instance: StripePriceCrudService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripePriceCrudService {
    if (!StripePriceCrudService.instance) {
      StripePriceCrudService.instance = new StripePriceCrudService();
    }
    return StripePriceCrudService.instance;
  }

  public getStripe() {
    return this.stripeService;
  }

  public async createPrice(
    priceData: Stripe.PriceCreateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.Price | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      if(!options?.stripeAccount){
        throw new Error('stripeAccount header is needed.');
      }

      const price = await this.stripeService.prices.create(priceData, options);
      return price;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating price: ${err.message}`,
      });
      return null;
    }
  }

  public async listPrices(options?: Stripe.RequestOptions): Promise<Stripe.Price[] | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const prices = await this.stripeService.prices.list(options);
      return prices.data;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving prices: ${err.message}`,
      });
      return null;
    }
  }

  public async getPrice(priceId: string, options?: Stripe.RequestOptions): Promise<Stripe.Price | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const price = await this.stripeService.prices.retrieve(priceId, options);
      return price;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving price: ${err.message}`,
      });
      return null;
    }
  }

  public async updatePrice(
    priceId: string,
    updates: Stripe.PriceUpdateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.Price | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const updatedPrice = await this.stripeService.prices.update(
        priceId,
        updates,
        options,
      );
      return updatedPrice;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error updating price: ${err.message}`,
      });
      return null;
    }
  }

  public async deactivatePrice(priceId: string, options?: Stripe.RequestOptions): Promise<Stripe.Price | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const deactivatedPrice = await this.stripeService.prices.update(priceId, {
        active: false,
      }, options);
      return deactivatedPrice;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error deactivating price: ${err.message}`,
      });
      return null;
    }
  }
}

export default StripePriceCrudService;
