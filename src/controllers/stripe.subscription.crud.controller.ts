import { Request, Response } from 'express';
import StripeSubscriptionCrudService from '../services/StripeSubscriptionCrudService';
import { Logger } from '../libs/Logger';

export const createSubscription = async (req: Request, res: Response) => {
  const { customerId, priceId } = req.body;
  const stripeAccount = req.headers['stripe-account'] as string
  if (!customerId || !priceId || !stripeAccount) {
    return res
      .status(400)
      .json({ message: 'customerId, connectedAccountId and priceId are required' });
  }
  try {
    const stripeCrudService =
      StripeSubscriptionCrudService.retrieveServiceInstance();
    const newSubscription = await stripeCrudService.createSubscription(
      stripeAccount,
      customerId,
      priceId,
    );

    if (newSubscription) {
      return res.status(201).json(newSubscription);
    } else {
      return res
        .status(500)
        .json({ message: 'Failed to create subscription.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating subscription: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const stripeCrudService =
      StripeSubscriptionCrudService.retrieveServiceInstance();
    const subscriptions = await stripeCrudService.listSubscriptions();

    if (subscriptions && subscriptions.length > 0) {
      return res.status(200).json(subscriptions);
    } else {
      return res.status(404).json({ message: 'No subscriptions found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving subscriptions: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getSubscription = async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  try {
    const stripeCrudService =
      StripeSubscriptionCrudService.retrieveServiceInstance();
    const subscription =
      await stripeCrudService.getSubscription(subscriptionId);

    if (subscription) {
      return res.status(200).json(subscription);
    } else {
      return res.status(404).json({ message: 'Subscription not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving subscription: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const updates = req.body;
  try {
    const stripeCrudService =
      StripeSubscriptionCrudService.retrieveServiceInstance();
    const updatedSubscription = await stripeCrudService.updateSubscription(
      subscriptionId,
      updates,
    );

    if (updatedSubscription) {
      return res.status(200).json(updatedSubscription);
    } else {
      return res.status(404).json({ message: 'Subscription not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error updating subscription: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  try {
    const stripeCrudService =
      StripeSubscriptionCrudService.retrieveServiceInstance();
    const canceledSubscription =
      await stripeCrudService.cancelSubscription(subscriptionId);

    if (canceledSubscription) {
      return res
        .status(200)
        .json({ message: 'Subscription canceled successfully.' });
    } else {
      return res.status(404).json({ message: 'Subscription not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error canceling subscription: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
