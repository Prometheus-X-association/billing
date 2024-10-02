import {Logger} from '../libs/Logger';
import ConnectedAccountParticipantMap from "../models/ConnectedAccountParticipantMap";

class BillingConnectedAccountService {
    private static instance: BillingConnectedAccountService;

    private constructor() {
    }

    public static retrieveServiceInstance(): BillingConnectedAccountService {
        if (!BillingConnectedAccountService.instance) {
            BillingConnectedAccountService.instance = new BillingConnectedAccountService();
        }
        return BillingConnectedAccountService.instance;
    }

    public async listConnectedAccounts(): Promise<typeof ConnectedAccountParticipantMap[] | null> {
        try {
            return await ConnectedAccountParticipantMap.find().lean();
        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving connected account: ${err.message}`,
            });
            return null;
        }
    }

    public async getConnectedAccountById(
        id: string,
    ): Promise<typeof ConnectedAccountParticipantMap | null> {
        try {
            return await ConnectedAccountParticipantMap.findById(id).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving connected account: ${err.message}`,
            });
            return null;
        }
    }

    public async getConnectedAccountByParticipantId(
        participantId: string,
    ): Promise<typeof ConnectedAccountParticipantMap | null> {
        try {
            return await ConnectedAccountParticipantMap.findOne({participantId}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving connected account: ${err.message}`,
            });
            return null;
        }
    }

    public async getConnectedAccountByConnectedAccountId(
        connectedAccountId: string,
    ): Promise<typeof ConnectedAccountParticipantMap | null> {
        try {
            return await ConnectedAccountParticipantMap.findOne({connectedAccountId}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving connected account: ${err.message}`,
            });
            return null;
        }
    }
}

export default BillingConnectedAccountService;
