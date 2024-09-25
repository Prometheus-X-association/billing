import { Request, Response } from 'express';
import { Logger } from '../libs/Logger';
import StripeSetupIntentService from '../services/StripeSetupIntentService';

export const createSetupIntent = async (req: Request, res: Response) => {
  try {
    const stripeSetupIntentService =
      StripeSetupIntentService.retrieveServiceInstance();
    const newSetupIntent = await stripeSetupIntentService.createSetupIntent(
      req.body,
      {
        stripeAccount: req.headers['stripe-account'] as string,
      },
    );

    if (newSetupIntent) {
      return res.status(201).json(newSetupIntent);
    } else {
      return res
        .status(500)
        .json({ message: 'Failed to create setup intent.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating setup intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const updateSetupIntent = async (req: Request, res: Response) => {
  const { setupIntentId } = req.params;
  try {
    const stripeSetupIntentService =
      StripeSetupIntentService.retrieveServiceInstance();
    const updatedSetupIntent = await stripeSetupIntentService.updateSetupIntent(
      setupIntentId,
      req.body,
      {
        stripeAccount: req.headers['stripe-account'] as string,
      },
    );

    if (updatedSetupIntent) {
      return res.status(200).json(updatedSetupIntent);
    } else {
      return res
        .status(404)
        .json({ message: 'Setup intent not found or could not be updated.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error updating setup intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getSetupIntent = async (req: Request, res: Response) => {
  const { setupIntentId } = req.params;
  try {
    const stripeSetupIntentService =
      StripeSetupIntentService.retrieveServiceInstance();
    const setupIntent = await stripeSetupIntentService.getSetupIntent(
      setupIntentId,
      {
        stripeAccount: req.headers['stripe-account'] as string,
      },
    );

    if (setupIntent) {
      return res.status(200).json(setupIntent);
    } else {
      return res.status(404).json({ message: 'Setup intent not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving setup intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const cancelSetupIntent = async (req: Request, res: Response) => {
  const { setupIntentId } = req.params;
  try {
    const stripeSetupIntentService =
      StripeSetupIntentService.retrieveServiceInstance();
    const canceledSetupIntent =
      await stripeSetupIntentService.cancelSetupIntent(setupIntentId, {
        stripeAccount: req.headers['stripe-account'] as string,
      });

    if (canceledSetupIntent) {
      return res.status(200).json(canceledSetupIntent);
    } else {
      return res
        .status(404)
        .json({ message: 'Setup intent not found or could not be canceled.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error canceling setup intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const confirmSetupIntent = async (req: Request, res: Response) => {
  const { setupIntentId } = req.params;
  try {
    const stripeSetupIntentService =
      StripeSetupIntentService.retrieveServiceInstance();
    const confirmedSetupIntent =
      await stripeSetupIntentService.confirmSetupIntent(
        setupIntentId,
        req.body,
        {
          stripeAccount: req.headers['stripe-account'] as string,
        },
      );

    if (confirmedSetupIntent) {
      return res.status(200).json(confirmedSetupIntent);
    } else {
      return res
        .status(404)
        .json({ message: 'Setup intent not found or could not be confirmed.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error confirming setup intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
