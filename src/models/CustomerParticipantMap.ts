import { Schema, model, Document } from 'mongoose';

interface ICustomerParticipantMap extends Document {
  customerId: string;
  participantId: string;
}

const CustomerParticipantMapSchema = new Schema<ICustomerParticipantMap>({
  customerId: { type: String, required: true, unique: true },
  participantId: { type: String, required: true },
});

const CustomerParticipantMap = model<ICustomerParticipantMap>(
  'CustomerParticipantMap',
  CustomerParticipantMapSchema,
);

export default CustomerParticipantMap;
