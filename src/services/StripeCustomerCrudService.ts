import StripeService from './StripeSubscriptionSyncService';
import {Logger} from '../libs/Logger';
import Stripe from 'stripe';

class StripeCustomerCrudService {
  private static instance: StripeCustomerCrudService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripeCustomerCrudService {
    if (!StripeCustomerCrudService.instance) {
      StripeCustomerCrudService.instance = new StripeCustomerCrudService();
    }
    return StripeCustomerCrudService.instance;
  }

  public async createCustomer(
    customerData: Stripe.CustomerCreateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.Customer | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      return await this.stripeService.customers.create(customerData, options);
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating customer: ${err.message}`,
      });
      return null;
    }
  }

  public async listCustomers(options?: Stripe.RequestOptions): Promise<Stripe.Customer[] | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const customers = await this.stripeService.customers.list(options);
      return customers.data;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving customers: ${err.message}`,
      });
      return null;
    }
  }

  public async getCustomer(
    customerId: string,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }

      const customer = await this.stripeService.customers.retrieve(customerId, options);
      if (customer.deleted) {
        return customer as Stripe.DeletedCustomer;
      } else {
        return customer as Stripe.Customer;
      }
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving customer: ${err.message}`,
      });
      return null;
    }
  }

  public async updateCustomer(
    customerId: string,
    updates: Stripe.CustomerUpdateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.Customer | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const updatedCustomer = await this.stripeService.customers.update(
        customerId,
        updates,
        options,
      );
      return updatedCustomer;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error updating customer: ${err.message}`,
      });
      return null;
    }
  }

  public async deleteCustomer(customerId: string, options?: Stripe.RequestOptions): Promise<boolean> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const deletedCustomer =
        await this.stripeService.customers.del(customerId, options);
      return deletedCustomer.deleted;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error deleting customer: ${err.message}`,
      });
      return false;
    }
  }
}

export default StripeCustomerCrudService;
