import mongoose, { Schema, Document, Collection, Types } from 'mongoose';
import { Subscription as BaseSubscription } from '../types/billing.subscription.types';
import {
  ChangeStreamDocument,
  ChangeStreamInsertDocument,
  ChangeStreamDeleteDocument,
} from 'mongodb';

export type ChangeHandlerCallback = (
  change: ChangeStreamDocument,
) => Promise<void>;

interface Subscription extends Omit<BaseSubscription, '_id'> {
  _id: Types.ObjectId;
}

interface SubscriptionDocument
  extends Omit<Document, 'collection'>,
    Subscription {
  collection: Collection;
}

class ChangeHandler {
  private callbacks: { [key: string]: ChangeHandlerCallback | null } = {
    insert: null,
    delete: null,
  };

  public registerCallback(
    event: 'insert' | 'delete',
    callback: ChangeHandlerCallback,
  ): void {
    this.callbacks[event] = callback;
  }

  public async triggerCallback(
    event: 'insert' | 'delete',
    change: ChangeStreamDocument,
  ): Promise<void> {
    const callback = this.callbacks[event];
    if (callback) {
      await callback(change);
    }
  }
}

export const changeHandler = new ChangeHandler();

const SubscriptionDetailSchema = new Schema(
  {
    limitDate: { type: Date },
    payAmount: { type: Number },
    usageCount: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false },
);

const SubscriptionSchema = new Schema({
  isActive: { type: Boolean, required: true },
  stripeId: { type: String },
  participantId: { type: String, required: true },
  subscriptionType: {
    type: String,
    enum: ['limitDate', 'payAmount', 'usageCount'],
    required: true,
  },
  resourceId: { type: String },
  resourceIds: { type: [String] },
  details: { type: SubscriptionDetailSchema, required: true },
});

SubscriptionSchema.index({ participantId: 1, resourceId: 1 });

interface SubscriptionDocument
  extends Omit<Document, 'collection'>,
    Subscription {
  _id: Types.ObjectId;
  collection: Collection;
}

const handleInsert = async (doc: SubscriptionDocument) => {
  const change: Partial<ChangeStreamInsertDocument<Subscription>> = {
    operationType: 'insert',
    fullDocument: doc.toObject(),
    documentKey: { _id: doc._id },
    ns: { db: doc.db.name, coll: doc.collection.collectionName },
  };
  await changeHandler.triggerCallback('insert', change as ChangeStreamDocument);
};

SubscriptionSchema.post(
  'insertMany',
  async function (docs: SubscriptionDocument[]) {
    for (const doc of docs) {
      await handleInsert(doc);
    }
  },
);

SubscriptionSchema.post('save', handleInsert);

SubscriptionSchema.pre('findOneAndDelete', async function () {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    const change: Partial<ChangeStreamDeleteDocument> = {
      operationType: 'delete',
      documentKey: { _id: docToDelete._id },
      ns: { db: 'votre_nom_de_base_de_données', coll: 'subscriptions' },
    };
    await changeHandler.triggerCallback(
      'delete',
      change as ChangeStreamDocument,
    );
  }
});

export const toSubscription = (doc: SubscriptionDocument): BaseSubscription => {
  const subscription = doc.toObject();
  subscription._id = subscription._id.toString();
  return subscription as BaseSubscription;
};

const SubscriptionModel = mongoose.model<Subscription & Document>(
  'Subscription',
  SubscriptionSchema,
);

export default SubscriptionModel;
