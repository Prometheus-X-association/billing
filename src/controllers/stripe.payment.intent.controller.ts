import { Request, Response } from 'express';
import { Logger } from '../libs/Logger';
import StripePaymentIntentCrudService from '../services/StripePaymentIntentCrudService';

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const stripePaymentIntentCrudService =
      StripePaymentIntentCrudService.retrieveServiceInstance();
    const newPaymentIntent =
      await stripePaymentIntentCrudService.createPaymentIntent(req.body, {
        stripeAccount: req.headers['stripe-account'] as string,
      });

    if (newPaymentIntent) {
      return res.status(201).json(newPaymentIntent);
    } else {
      return res
        .status(500)
        .json({ message: 'Failed to create payment intent.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating payment intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const updatePaymentIntent = async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;
  try {
    const stripePaymentIntentCrudService =
      StripePaymentIntentCrudService.retrieveServiceInstance();
    const updatedPaymentIntent =
      await stripePaymentIntentCrudService.updatePaymentIntent(
        paymentIntentId,
        req.body,
        { stripeAccount: req.headers['stripe-account'] as string },
      );

    if (updatedPaymentIntent) {
      return res.status(200).json(updatedPaymentIntent);
    } else {
      return res.status(404).json({ message: 'Payment intent not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error updating payment intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getPaymentIntent = async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;
  try {
    const stripePaymentIntentCrudService =
      StripePaymentIntentCrudService.retrieveServiceInstance();
    const paymentIntent = await stripePaymentIntentCrudService.getPaymentIntent(
      paymentIntentId,
      {
        stripeAccount: req.headers['stripe-account'] as string,
      },
    );

    if (paymentIntent) {
      return res.status(200).json(paymentIntent);
    } else {
      return res.status(404).json({ message: 'Payment intent not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving payment intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const confirmPaymentIntent = async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;
  try {
    const stripePaymentIntentCrudService =
      StripePaymentIntentCrudService.retrieveServiceInstance();
    const confirmedPaymentIntent =
      await stripePaymentIntentCrudService.confirmPaymentIntent(
        paymentIntentId,
        req.body,
        { stripeAccount: req.headers['stripe-account'] as string },
      );

    if (confirmedPaymentIntent) {
      return res.status(200).json(confirmedPaymentIntent);
    } else {
      return res.status(404).json({
        message: 'Payment intent not found or could not be confirmed.',
      });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error confirming payment intent: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
