import StripeService from './StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';
import Stripe from 'stripe';

class StripeConnectedAccountService {
  private static instance: StripeConnectedAccountService;
  private stripeService: Stripe | null = null;

  private constructor() {
    const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
    if (stripeInstance) {
      this.stripeService = stripeInstance;
    } else {
      throw new Error('Stripe instance is not initialized.');
    }
  }

  public static retrieveServiceInstance(): StripeConnectedAccountService {
    if (!StripeConnectedAccountService.instance) {
      StripeConnectedAccountService.instance =
        new StripeConnectedAccountService();
    }
    return StripeConnectedAccountService.instance;
  }

  public async createConnectedAccount(
    accountData: Stripe.AccountCreateParams,
  ): Promise<Stripe.Account | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const account = await this.stripeService.accounts.create(accountData);
      return account;
    } catch (error) {
      Logger.error({
        location: (error as Error).stack,
        message: `Error creating connected account: ${(error as Error).message}`,
      });
      return null;
    }
  }

  public async updateConnectedAccount(
    accountId: string,
    updates: Stripe.AccountUpdateParams,
  ): Promise<Stripe.Account | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const account = await this.stripeService.accounts.update(
        accountId,
        updates,
      );
      return account;
    } catch (error) {
      Logger.error({
        location: (error as Error).stack,
        message: `Error updating connected account: ${(error as Error).message}`,
      });
      return null;
    }
  }

  public async getConnectedAccount(
    accountId: string,
  ): Promise<Stripe.Account | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const account = await this.stripeService.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      Logger.error({
        location: (error as Error).stack,
        message: `Error retrieving connected account: ${(error as Error).message}`,
      });
      return null;
    }
  }

  public async deleteConnectedAccount(accountId: string): Promise<boolean> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const deletedAccount = await this.stripeService.accounts.del(accountId);
      return deletedAccount.deleted;
    } catch (error) {
      Logger.error({
        location: (error as Error).stack,
        message: `Error deleting connected account: ${(error as Error).message}`,
      });
      return false;
    }
  }

  public async createLoginLink(
    accountId: string,
  ): Promise<Stripe.LoginLink | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const loginLink =
        await this.stripeService.accounts.createLoginLink(accountId);
      return loginLink;
    } catch (error) {
      Logger.error({
        location: (error as Error).stack,
        message: `Error creating login link: ${(error as Error).message}`,
      });
      return null;
    }
  }

  public async createAccountLinks(
    accountLinkData: Stripe.AccountLinkCreateParams,
  ): Promise<Stripe.AccountLink | null> {
    try {
      if (!this.stripeService) {
        throw new Error('Stripe instance is not initialized.');
      }
      const accountLink = await this.stripeService.accountLinks.create(
        accountLinkData,
      );
      return accountLink;
    } catch (error) {
      Logger.error({
        location: (error as Error).stack,
        message: `Error creating account link: ${(error as Error).message}`,
      });
      return null;
    }
  }
}

export default StripeConnectedAccountService;
