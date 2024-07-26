import mongoose, { Schema } from 'mongoose';
import { Subscription } from '../types/billing.subscription.types';

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

const SubscriptionModel = mongoose.model<Subscription>(
  'Subscription',
  SubscriptionSchema,
);

export default SubscriptionModel;
