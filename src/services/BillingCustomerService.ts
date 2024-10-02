import {Logger} from '../libs/Logger';
import CustomerParticipantMap from "../models/CustomerParticipantMap";

class BillingCustomerService {
    private static instance: BillingCustomerService;

    private constructor() {
    }

    public static retrieveServiceInstance(): BillingCustomerService {
        if (!BillingCustomerService.instance) {
            BillingCustomerService.instance = new BillingCustomerService();
        }
        return BillingCustomerService.instance;
    }

    public async listCustomers(): Promise<typeof CustomerParticipantMap[] | null> {
        try {
            return await CustomerParticipantMap.find().lean();
        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customers: ${err.message}`,
            });
            return null;
        }
    }

    public async getCustomerById(
        id: string,
    ): Promise<typeof CustomerParticipantMap | null> {
        try {
            return await CustomerParticipantMap.findById(id).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customer: ${err.message}`,
            });
            return null;
        }
    }

    public async getCustomerByParticipantId(
        participantId: string,
    ): Promise<typeof CustomerParticipantMap | null> {
        try {
            return await CustomerParticipantMap.findOne({participantId}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customer: ${err.message}`,
            });
            return null;
        }
    }

    public async getCustomerByCustomerId(
        customerId: string,
    ): Promise<typeof CustomerParticipantMap | null> {
        try {
            return await CustomerParticipantMap.findOne({customerId}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customer: ${err.message}`,
            });
            return null;
        }
    }
}

export default BillingCustomerService;
