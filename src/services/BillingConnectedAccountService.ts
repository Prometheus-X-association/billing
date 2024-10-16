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

    public async getConnectedAccountByParticipant(
        participant: string,
    ): Promise<typeof ConnectedAccountParticipantMap | null> {
        try {
            return await ConnectedAccountParticipantMap.findOne({participant}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving connected account: ${err.message}`,
            });
            return null;
        }
    }

    public async getConnectedAccountByStripeAccount(
        stripeAccount: string,
    ): Promise<typeof ConnectedAccountParticipantMap | null> {
        try {
            return await ConnectedAccountParticipantMap.findOne({stripeAccount}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving connected account: ${err.message}`,
            });
            return null;
        }
    }

    public async addConnectedAccount(props: {
        participant: string,
        stripeAccount: string,
    }): Promise<typeof ConnectedAccountParticipantMap & {_id: string} | null> {
        try {
            const connectedAccount = await ConnectedAccountParticipantMap.create({
                participant: props.participant,
                stripeAccount: props.stripeAccount,
            });

            await connectedAccount.save();
            
            return connectedAccount.toObject();
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
