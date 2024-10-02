import {Logger} from '../libs/Logger';
import ProductOfferMap from "../models/ProductOfferMap";

class BillingProductService {
    private static instance: BillingProductService;

    private constructor() {
    }

    public static retrieveServiceInstance(): BillingProductService {
        if (!BillingProductService.instance) {
            BillingProductService.instance = new BillingProductService();
        }
        return BillingProductService.instance;
    }

    public async listProductsByParticipantId(participantId: string): Promise<typeof ProductOfferMap[] | null> {
        try {
            return await ProductOfferMap.find({
                participantId
            }).lean();
        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving products: ${err.message}`,
            });
            return null;
        }
    }

    public async getProductById(
        id: string,
    ): Promise<typeof ProductOfferMap | null> {
        try {
            return await ProductOfferMap.findById(id).lean();

        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customer: ${err.message}`,
            });
            return null;
        }
    }

    public async createProduct(props: {
        participantId: string;
        stripeId: string;
        defaultPriceId: string;
        offerId: string;
    }){
        try {
            return await ProductOfferMap.create(props);
        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error retrieving customer: ${err.message}`,
            });
            return null;
        }
    }

    public async addPrice(props: {
        id: string;
        customerId: string;
        stripeId: string;
    }): Promise<typeof ProductOfferMap | null> {
        try {
            return await ProductOfferMap.findByIdAndUpdate(props.id, {
                $push: {
                    prices: {
                        customerId: props.customerId,
                        stripeId: props.stripeId,
                    }
                }
            }, {
                new: true
            }).lean();

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

export default BillingProductService;
