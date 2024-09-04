import mongoose from 'mongoose';
import BillingSubscriptionService from './BillingSubscriptionService';
import {
  ChangeStreamInsertDocument,
  ChangeStreamDeleteDocument,
  ChangeStreamDocument,
} from 'mongodb';
import SubscriptionModel, {
  changeHandler,
  ChangeHandlerCallback,
  toSubscription,
} from '../models/SubscriptionModel';
import { config } from '../config/environment';
import { Subscription } from '../types/billing.subscription.types';

class BillingSubscriptionSyncService {
  private static instance: BillingSubscriptionSyncService;
  private billingService?: BillingSubscriptionService;

  constructor() {}

  public static async getService(): Promise<BillingSubscriptionSyncService> {
    if (!BillingSubscriptionSyncService.instance) {
      BillingSubscriptionSyncService.instance =
        new BillingSubscriptionSyncService();
      BillingSubscriptionSyncService.instance.setBillingService(
        BillingSubscriptionService.getService(),
      );
      await BillingSubscriptionSyncService.instance.connect(config.mongoURI);
    }
    return BillingSubscriptionSyncService.instance;
  }

  public async connect(mongoUri: string | undefined) {
    try {
      if (!mongoUri) {
        throw new Error('Mongo URI is undefined');
      }
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB from sync service');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
    try {
      await this.loadSubscriptions();
      this.handleChanges();
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  }

  public async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Failed to disconnect from MongoDB:', error);
      throw error;
    }
  }

  public setBillingService(billingService: BillingSubscriptionService) {
    this.billingService = billingService;
  }

  public async loadSubscriptions() {
    if (!this.billingService) {
      console.warn('Billing service is not set');
      return;
    }

    try {
      const subscriptions = await SubscriptionModel.find({
        isActive: true,
      }).select('-__v');

      if (subscriptions.length > 0) {
        const subs: Subscription[] = subscriptions.map(toSubscription);
        this.billingService.addSubscription(subs);
        console.log(`Loaded ${subscriptions.length} active subscriptions`);
      } else {
        console.log('No active subscriptions found');
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      throw error;
    }
  }

  private handleChanges() {
    changeHandler.registerCallback(
      'insert',
      async (change: ChangeStreamDocument): Promise<void> => {
        this.handleInsert(change as ChangeStreamInsertDocument);
      },
    );
    changeHandler.registerCallback(
      'delete',
      async (change: ChangeStreamDocument): Promise<void> => {
        this.handleDelete(change as ChangeStreamDeleteDocument);
      },
    );
  }

  private handleInsert(change: ChangeStreamInsertDocument) {
    if (this.billingService) {
      this.billingService.addSubscription({
        ...(change.fullDocument as Subscription),
        _id: (change.fullDocument as Subscription)._id.toString(),
      });
    } else {
      throw new Error('Billing service is not set');
    }
  }

  private handleDelete(change: ChangeStreamDeleteDocument) {
    const subscriptionId = change.documentKey._id;
    if (this.billingService) {
      this.billingService.removeSubscriptionById(subscriptionId.toString());
    } else {
      throw new Error('Billing service is not set');
    }
  }

  public async addSubscriptions(subscriptions: Subscription[]) {
    try {
      const result = await SubscriptionModel.insertMany(subscriptions);
      console.log(`Added ${result.length} subscriptions`);
      return result;
    } catch (error) {
      console.error('Error adding subscriptions:', error);
      throw error;
    }
  }

  public async removeSubscription(subscriptionId: string) {
    try {
      const result = await SubscriptionModel.findByIdAndDelete(subscriptionId);
      if (result) {
        console.log(`Removed subscription with ID: ${subscriptionId}`);
        return result;
      } else {
        console.log(`Subscription with ID ${subscriptionId} not found`);
        return null;
      }
    } catch (error) {
      console.error('Error removing subscription:', error);
      throw error;
    }
  }
}

export default BillingSubscriptionSyncService;
