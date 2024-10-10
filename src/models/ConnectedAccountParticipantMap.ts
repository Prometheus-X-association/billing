import { Schema, model, Document } from 'mongoose';

interface IConnectedAccountParticipantMap extends Document {
    stripeAccount: string;
    participant: string;
}

const ConnectedAccountParticipantMapSchema = new Schema<IConnectedAccountParticipantMap>({
    stripeAccount: { type: String, required: true, unique: true },
    participant: { type: String, required: true },
});

const ConnectedAccountParticipantMap = model<IConnectedAccountParticipantMap>(
    'ConnectedAccountParticipantMap',
    ConnectedAccountParticipantMapSchema,
);

export default ConnectedAccountParticipantMap;
