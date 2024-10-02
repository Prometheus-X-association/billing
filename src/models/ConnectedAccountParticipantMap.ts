import { Schema, model, Document } from 'mongoose';

interface IConnectedAccountParticipantMap extends Document {
    connectedAccountId: string;
    participantId: string;
}

const ConnectedAccountParticipantMapSchema = new Schema<IConnectedAccountParticipantMap>({
    connectedAccountId: { type: String, required: true, unique: true },
    participantId: { type: String, required: true },
});

const ConnectedAccountParticipantMap = model<IConnectedAccountParticipantMap>(
    'ConnectedAccountParticipantMap',
    ConnectedAccountParticipantMapSchema,
);

export default ConnectedAccountParticipantMap;
