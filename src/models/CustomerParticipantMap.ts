import { Schema, model, Document } from 'mongoose';

export interface ICustomerParticipantMap extends Document {
  stripeCustomerId: string;
  participant: string;
}

const CustomerParticipantMapSchema = new Schema<ICustomerParticipantMap>({
  stripeCustomerId: { type: String, required: true, unique: true },
  participant: { type: String, required: true },
});

const CustomerParticipantMap = model<ICustomerParticipantMap>(
  'CustomerParticipantMap',
  CustomerParticipantMapSchema,
);

export default CustomerParticipantMap;
