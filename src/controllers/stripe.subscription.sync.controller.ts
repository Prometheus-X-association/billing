import { Request, Response } from 'express';
import { config } from '../config/environment';
import StripeService from '../services/StripeSubscriptionSyncService';
import { Logger } from '../libs/Logger';

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
    Logger.error({
      location: error.stack,
      message: error.message,
    });
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export const linkParticipantToCustomer = async (
  req: Request,
  res: Response,
) => {
  try {
    const { participant, stripeCustomerId } = req.body;

    if (!participant || !stripeCustomerId) {
      return res
        .status(400)
        .json({ message: 'participant and stripeCustomerId are required' });
    }
    const stripeService = StripeService.retrieveServiceInstance();
    await stripeService.linkParticipantToCustomer(participant, stripeCustomerId);
    res.status(200).json({ message: 'Link established successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error linking participant to customer', error });
  }
};

export const linkParticipantToConnectedAccount = async (
  req: Request,
  res: Response,
) => {
  try {
    const { participant, stripeAccount } = req.body;

    if (!participant || !stripeAccount) {
      return res
        .status(400)
        .json({ message: 'participant and stripeAccount are required' });
    }
    const stripeService = StripeService.retrieveServiceInstance();
    const mapping = await stripeService.linkParticipantToConnectedAccount(participant, stripeAccount);
    res.status(200).json(mapping);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error linking participant to customer', error });
  }
};

export const unlinkParticipantFromCustomer = async (
  req: Request,
  res: Response,
) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(400).json({ message: 'customerId is required' });
    }
    const stripeService = StripeService.retrieveServiceInstance();
    await stripeService.unlinkParticipantFromCustomer(customerId);
    res.status(200).json({ message: 'Link removed successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error unlinking participant from customer', error });
  }
};

export const unlinkParticipantFromConnectedAccount = async (
  req: Request,
  res: Response,
) => {
  try {
    const { stripeAccount } = req.params;
    if (!stripeAccount) {
      return res.status(400).json({ message: 'stripeAccount is required' });
    }
    const stripeService = StripeService.retrieveServiceInstance();
    await stripeService.unlinkParticipantFromConnectedAccount(stripeAccount);
    res.status(200).json({ message: 'Link removed successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error unlinking participant from connected account', error });
  }
};
