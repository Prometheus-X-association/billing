import mongoose from 'mongoose';
import BillingSubscriptionService from './BillingSubscriptionService';
import {
  ChangeStreamInsertDocument,
  ChangeStreamDeleteDocument,
  ChangeStreamDocument,
} from 'mongodb';
import SubscriptionModel, {
  changeHandler,
  toSubscription,
} from '../models/SubscriptionModel';
import { config } from '../config/environment';
import { Subscription } from '../types/billing.subscription.types';
import { Logger } from '../libs/Logger';

class BillingSubscriptionSyncService {
  private static instance: BillingSubscriptionSyncService;
  private billingService?: BillingSubscriptionService;

  constructor() {}

  public static async retrieveServiceInstance(): Promise<BillingSubscriptionSyncService> {
    if (!BillingSubscriptionSyncService.instance) {
      const instance = new BillingSubscriptionSyncService();
      instance.setBillingService(
        BillingSubscriptionService.retrieveServiceInstance(),
      );
      await instance.connect(config.mongoURI);
      await instance.sync();
      BillingSubscriptionSyncService.instance = instance;
    }
    return BillingSubscriptionSyncService.instance;
  }

  public async connect(mongoUri: string | undefined) {
    try {
      if (!mongoUri) {
        throw new Error('Mongo URI is undefined');
      }
      await mongoose.connect(mongoUri);
      Logger.log({
        message: 'Connected to MongoDB from sync service',
      });
    } catch (error) {
      const err = error as Error;
      Logger.error({
        message: `Failed to connect to MongoDB: ${err.message}`,
      });
      throw error;
    }
  }

  public async refresh() {
    if (!this.billingService) {
      Logger.warn({
        message: `Unable to refresh: Billing service is not set`,
      });
      return;
    }
    this.billingService.clean();
    this.sync();
  }

  private async sync() {
    try {
      await this.loadSubscriptions();
      this.handleChanges();
      Logger.log({
        message: 'Sync completed',
      });
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Failed to sync: ${err.message}`,
      });
    }
  }

  public async disconnect() {
    try {
      await mongoose.disconnect();
      Logger.log({
        message: 'Disconnected from MongoDB',
      });
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Failed to disconnect from MongoDB: ${err.message}`,
      });
      throw error;
    }
  }

  public setBillingService(billingService: BillingSubscriptionService) {
    this.billingService = billingService;
  }

  public async loadSubscriptions() {
    if (!this.billingService) {
      Logger.warn({
        message: 'Billing service is not set',
      });
      return;
    }

    try {
      const subscriptions = await SubscriptionModel.find({
        isActive: true,
      }).select('-__v');

      if (subscriptions.length > 0) {
        const subs: Subscription[] = subscriptions.map(toSubscription);
        this.billingService.addSubscription(subs);
        Logger.log({
          message: `Syncing ${subscriptions.length} active subscriptions into in-memory cache during startup`,
        });
      } else {
        Logger.warn({
          message: 'No active subscriptions found',
        });
      }
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error loading subscriptions: ${err.message}`,
      });
      throw error;
    }
  }

  private handleChanges() {
    changeHandler.registerCallback(
      'insert',
      async (change: ChangeStreamDocument): Promise<void> => {
        try {
          this.handleInsert(change as ChangeStreamInsertDocument);
        } catch (error) {
          Logger.error({
            message: `Error handling insert: ${(error as Error).message}`,
            location: (error as Error).stack,
          });
        }
      },
    );
    changeHandler.registerCallback(
      'delete',
      async (change: ChangeStreamDocument): Promise<void> => {
        try {
          this.handleDelete(change as ChangeStreamDeleteDocument);
        } catch (error) {
          Logger.error({
            message: `Error handling delete: ${(error as Error).message}`,
            location: (error as Error).stack,
          });
        }
      },
    );
  }

  private handleInsert(change: ChangeStreamInsertDocument) {
    if (this.billingService) {
      const subscription: Subscription = change.fullDocument as Subscription;
      if (subscription._id) {
        const _id = subscription._id.toString();
        this.billingService.addSubscription({
          ...subscription,
          _id,
        });
        Logger.log({
          message: `Syncing in-memory cache after subscription insertion: ${_id}`,
        });
      } else {
        Logger.error({
          message: 'Subscription ID is missing or invalid',
        });
        throw new Error('Subscription ID is missing or invalid');
      }
    } else {
      Logger.error({
        message: 'Billing service is not set',
      });
      throw new Error('Billing service is not set');
    }
  }

  private handleDelete(change: ChangeStreamDeleteDocument) {
    const _id = change.documentKey._id;
    if (this.billingService) {
      this.billingService.removeSubscriptionById(_id.toString());
      Logger.log({
        message: `Syncing in-memory cache after subscription deletion: ${_id}`,
      });
    } else {
      throw new Error('Billing service is not set');
    }
  }

  public async addSubscriptions(subscriptions: Subscription[]) {
    try {
      const result = await SubscriptionModel.insertMany(subscriptions);
      Logger.log({
        message: `Added ${result.length} new subscriptions`,
      });
      return result;
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error adding subscriptions: ${err.message}`,
      });
      throw error;
    }
  }

  public async removeSubscription(subscriptionId: string) {
    try {
      const result = await SubscriptionModel.findByIdAndDelete(subscriptionId);
      if (result) {
        Logger.log({
          message: `Removed subscription with ID: ${subscriptionId}`,
        });
        return result;
      } else {
        Logger.warn({
          message: `Subscription with ID ${subscriptionId} not found`,
        });
        return null;
      }
    } catch (error) {
      const err = error as Error;
      Logger.error({
        location: err.stack,
        message: `Error removing subscription: ${err.message}`,
      });
      throw error;
    }
  }
}

export default BillingSubscriptionSyncService;
