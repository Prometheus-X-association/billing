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

    public async listProductsByParticipant(participant: string): Promise<typeof ProductOfferMap & {_id: string}[] | null> {
        try {
            return await ProductOfferMap.find({
                participant
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
        participant: string;
        stripeId: string;
        defaultPriceId: string;
        offer: string;
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
        stripeCustomerId: string;
        stripeId: string;
    }): Promise<typeof ProductOfferMap | null> {
        try {
            return await ProductOfferMap.findByIdAndUpdate(props.id, {
                $push: {
                    prices: {
                        stripeCustomerId: props.stripeCustomerId,
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
