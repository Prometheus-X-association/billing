import mongoose, { Document, Schema } from 'mongoose';

interface SubscriptionDetail {
  subscriptionDateTime?: Date;
  payAmount?: number;
  usageCount?: number;
}

interface Subscription extends Document {
  isActive: boolean;
  participantId: string;
  subscriptionType: 'subscriptionDateTime' | 'payAmount' | 'usageCount';
  resourceId?: string;
  resourceIds?: string[];
  details: SubscriptionDetail;
}

const SubscriptionDetailSchema = new Schema({
  subscriptionDateTime: { type: Date },
  payAmount: { type: Number },
  usageCount: { type: Number },
});

const SubscriptionSchema = new Schema({
  isActive: { type: Boolean, required: true },
  participantId: { type: String, required: true },
  subscriptionType: {
    type: String,
    enum: ['subscriptionDateTime', 'payAmount', 'usageCount'],
    required: true,
  },
  resourceId: { type: String },
  resourceIds: { type: [String] },
  details: { type: SubscriptionDetailSchema, required: true },
});

SubscriptionSchema.index({ participantId: 1, resourceId: 1 });

const SubscriptionModel = mongoose.model<Subscription>(
  'Subscription',
  SubscriptionSchema,
);

export default SubscriptionModel;
