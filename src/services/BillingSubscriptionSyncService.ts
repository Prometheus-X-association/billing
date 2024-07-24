import mongoose from 'mongoose';
import BillingSubscriptionService from './BillingSubscriptionService';
import {
  ChangeStreamInsertDocument,
  ChangeStreamDeleteDocument,
  ChangeStreamDocument,
} from 'mongodb';
import SubscriptionModel from '../models/SubscriptionModel';
import { config } from '../config/environment';

class BillingSubscriptionSyncService {
  private static instance: BillingSubscriptionSyncService;
  private billingService?: BillingSubscriptionService;

  constructor(mongoUri: string | undefined) {
    if (mongoUri) {
      mongoose.connect(mongoUri);
    } else {
      throw new Error('Mongo URI is undefined');
    }
  }

  public setBillingService(billingService: BillingSubscriptionService) {
    this.billingService = billingService;
  }

  public static getService(): BillingSubscriptionSyncService {
    if (!BillingSubscriptionSyncService.instance) {
      BillingSubscriptionSyncService.instance =
        new BillingSubscriptionSyncService(config.mongoURI);
    }
    return BillingSubscriptionSyncService.instance;
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
        this.billingService.addSubscription(
          subscriptions.map((sub) => ({
            ...sub,
            _id: sub._id.toString(),
          })),
        );
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
}

export default BillingSubscriptionSyncService;
