import StripeService from './StripeSubscriptionSyncService';
import {Logger} from '../libs/Logger';
import Stripe from 'stripe';

class StripeSessionCrudService {
    private static instance: StripeSessionCrudService;
    private stripeService: Stripe | null = null;

    private constructor() {
        const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
        if (stripeInstance) {
            this.stripeService = stripeInstance;
        } else {
            throw new Error('Stripe instance is not initialized.');
        }
    }

    public static retrieveServiceInstance(): StripeSessionCrudService {
        if (!StripeSessionCrudService.instance) {
            StripeSessionCrudService.instance = new StripeSessionCrudService();
        }
        return StripeSessionCrudService.instance;
    }

    public getStripe() {
        return this.stripeService;
    }

    public async createSession(
        sessionData: Stripe.Checkout.SessionCreateParams,
        options?: Stripe.RequestOptions,
    ): Promise<Stripe.Checkout.Session | null> {
        try {
            if (!this.stripeService) {
                throw new Error('Stripe instance is not initialized.');
            }
            if(!options?.stripeAccount){
                throw new Error('stripeAccount header is needed.');
            }

            return await this.stripeService.checkout.sessions.create(sessionData, options);
        } catch (error) {
            const err = error as Error;
            Logger.error({
                location: err.stack,
                message: `Error creating price: ${err.message}`,
            });
            return null;
        }
    }
}

export default StripeSessionCrudService;
