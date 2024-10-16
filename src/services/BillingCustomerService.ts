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

    public async getCustomerByParticipant(
        participant: string,
    ): Promise<typeof CustomerParticipantMap | null> {
        try {
            return await CustomerParticipantMap.findOne({participant}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customer: ${err.message}`,
            });
            return null;
        }
    }

    public async getCustomerByStripeCustomerId(
        stripeCustomerId: string,
    ): Promise<typeof CustomerParticipantMap | null> {
        try {
            return await CustomerParticipantMap.findOne({stripeCustomerId}).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customer: ${err.message}`,
            });
            return null;
        }
    }

    public async addCustomer(props: {
        participant: string;
        stripeCustomerId: string;
    }): Promise<typeof CustomerParticipantMap & {_id: string} | null> {
        try {
            const newCustomer = new CustomerParticipantMap(props);
            await newCustomer.save();
            return newCustomer.toObject();
        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error adding customer: ${err.message}`,
            });
            return null;
        }
    }
}

export default BillingCustomerService;
