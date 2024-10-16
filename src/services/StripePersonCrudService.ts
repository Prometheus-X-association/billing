import StripeService from './StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';
import Stripe from 'stripe';

class StripePersonCrudService {
  private static instance: StripePersonCrudService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripePersonCrudService {
    if (!StripePersonCrudService.instance) {
      StripePersonCrudService.instance = new StripePersonCrudService();
    }
    return StripePersonCrudService.instance;
  }

  public async createPerson(
    accountId: string,
    personData: Stripe.PersonCreateParams,
  ): Promise<Stripe.Person | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const person = await this.stripeService.accounts.createPerson(
        accountId,
        personData,
      );
      return person;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error creating person: ${err.message}`,
      });
      return null;
    }
  }

  public async updatePerson(
    accountId: string,
    personId: string,
    updates: Stripe.PersonUpdateParams,
  ): Promise<Stripe.Person | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const updatedPerson = await this.stripeService.accounts.updatePerson(
        accountId,
        personId,
        updates,
      );
      return updatedPerson;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error updating person: ${err.message}`,
      });
      return null;
    }
  }

  public async getPerson(
    accountId: string,
    personId: string,
  ): Promise<Stripe.Person | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const person = await this.stripeService.accounts.retrievePerson(
        accountId,
        personId,
      );
      return person;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error retrieving person: ${err.message}`,
      });
      return null;
    }
  }

  public async deletePerson(
    accountId: string,
    personId: string,
  ): Promise<boolean> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const deletedPerson = await this.stripeService.accounts.deletePerson(
        accountId,
        personId,
      );
      return deletedPerson.deleted;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error deleting person: ${err.message}`,
      });
      return false;
    }
  }

  public getStripe() {
    return this.stripeService;
  }
}

export default StripePersonCrudService;
