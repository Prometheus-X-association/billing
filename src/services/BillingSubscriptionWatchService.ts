import mongoose from 'mongoose';
import BillingSubscriptionService from './BillingSubscriptionService';
import {
  ChangeStreamInsertDocument,
  ChangeStreamDeleteDocument,
  ChangeStreamDocument,
} from 'mongodb';
import SubscriptionModel from '../models/SubscriptionModel';

class SubscriptionChangeWatcher {
  private billingService: BillingSubscriptionService;

  constructor(mongoUri: string, billingService: BillingSubscriptionService) {
    mongoose.connect(mongoUri);
    this.billingService = billingService;
  }

  public async startWatching() {
    try {
      await mongoose.connection.asPromise();
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
    this.billingService.addSubscription(change.fullDocument as any);
  }

  private handleDelete(change: ChangeStreamDeleteDocument) {
    const subscriptionId = change.documentKey._id;
    this.billingService.removeSubscriptionById(subscriptionId.toString());
  }
}

export default SubscriptionChangeWatcher;
