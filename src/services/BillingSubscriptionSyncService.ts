import mongoose from 'mongoose';
import BillingSubscriptionService from './BillingSubscriptionService';
import {
  ChangeStreamInsertDocument,
  ChangeStreamDeleteDocument,
  ChangeStreamDocument,
} from 'mongodb';
import SubscriptionModel from '../models/SubscriptionModel';
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
      throw new Error('Billing service is not set');
    }

    try {
      const subscriptions = await SubscriptionModel.find({
        isActive: true,
      })
        .select('-__v')
        .lean();

      if (subscriptions.length > 0) {
        this.billingService.addSubscription(subscriptions);
        console.log(`Loaded ${subscriptions.length} active subscriptions`);
      } else {
        console.log('No active subscriptions found');
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      throw error;
    }
  }

  public async startWatching() {
    try {
      await mongoose.connection.asPromise();
      console.log('Connected to MongoDB');

      await this.loadSubscriptions();

      console.log('Watching for changes on the subscriptions collection');
      const changeStream = SubscriptionModel.watch();
      changeStream.on('change', (change: ChangeStreamDocument) => {
        console.log('Change detected:', change);
        this.handleChange(change);
      });
    } catch (error) {
      console.error('Error starting change stream:', error);
    }
  }

  private async handleChange(change: ChangeStreamDocument) {
    switch (change.operationType) {
      case 'insert':
        this.handleInsert(change as ChangeStreamInsertDocument);
        break;
      case 'delete':
        this.handleDelete(change as ChangeStreamDeleteDocument);
        break;
      default:
        console.warn('Unhandled change type:', change.operationType);
    }
  }

  private handleInsert(change: ChangeStreamInsertDocument) {
    if (this.billingService) {
      this.billingService.addSubscription(change.fullDocument as any);
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
