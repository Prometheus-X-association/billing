import { Request, Response } from 'express';
import { config } from '../config/environment';
import StripeService from '../services/StripeSubscriptionService';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.get('stripe-signature');
  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Missing "Stripe-Signature" header');
  }
  try {
    const stripeService = StripeService.retrieveServiceInstance();
    const stripe = stripeService.getStripe();
    if (!stripe) {
      throw new Error('Stripe instance is not initialized.');
    }
    if (!config.stripeWebhookSecret) {
      throw new Error('Stripe webhook secret is not set in configuration.');
    }
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripeWebhookSecret,
    );
    await stripeService.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
