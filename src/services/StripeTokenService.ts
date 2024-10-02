import StripeService from './StripeSubscriptionSyncService';
import {Logger} from '../libs/Logger';
import Stripe from 'stripe';

class StripeTokenService {
    private static instance: StripeTokenService;
    private stripeService: Stripe | null = null;

    private constructor() {
        const stripeInstance = StripeService.retrieveServiceInstance().getStripe();
        if (stripeInstance) {
            this.stripeService = stripeInstance;
        } else {
            throw new Error('Stripe instance is not initialized.');
        }
    }

    public static retrieveServiceInstance(): StripeTokenService {
        if (!StripeTokenService.instance) {
            StripeTokenService.instance =
                new StripeTokenService();
        }
        return StripeTokenService.instance;
    }

    public async createAccountToken(
        accountTokenData: Stripe.TokenCreateParams,
    ): Promise<Stripe.Token | null> {
        try {
            if (!this.stripeService) {
                throw new Error('Stripe instance is not initialized.');
            }
            return await this.stripeService.tokens.create(accountTokenData);
        } catch (error) {
            Logger.error({
                location: (error as Error).stack,
                message: `Error creating account token: ${(error as Error).message}`,
            });
            return null;
        }
    }
}

export default StripeTokenService;
