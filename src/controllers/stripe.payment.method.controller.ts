import { Request, Response } from 'express';
import { Logger } from '../libs/Logger';
import StripePaymentMethodService from '../services/StripePaymentMethodService';

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const stripePaymentMethodService =
      StripePaymentMethodService.retrieveServiceInstance();
    const newPaymentMethod =
      await stripePaymentMethodService.createPaymentMethod(req.body, {
        stripeAccount: req.headers['stripe-account'] as string,
      });

    if (newPaymentMethod) {
      return res.status(201).json(newPaymentMethod);
    } else {
      return res
        .status(500)
        .json({ message: 'Failed to create payment method.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating payment method: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const attachPaymentMethod = async (req: Request, res: Response) => {
  const { paymentMethodId } = req.params;
  try {
    const stripePaymentMethodService =
      StripePaymentMethodService.retrieveServiceInstance();
    const attachedPaymentMethod =
      await stripePaymentMethodService.attachPaymentMethod(
        paymentMethodId,
        req.body.customer,
        {
          stripeAccount: req.headers['stripe-account'] as string,
        },
      );

    if (attachedPaymentMethod) {
      return res.status(200).json(attachedPaymentMethod);
    } else {
      return res.status(404).json({
        message: 'Payment method not found or could not be attached.',
      });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error attaching payment method: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getPaymentMethod = async (req: Request, res: Response) => {
  const { paymentMethodId } = req.params;
  try {
    const stripePaymentMethodService =
      StripePaymentMethodService.retrieveServiceInstance();
    const paymentMethod = await stripePaymentMethodService.getPaymentMethod(
      paymentMethodId,
      {
        stripeAccount: req.headers['stripe-account'] as string,
      },
    );

    if (paymentMethod) {
      return res.status(200).json(paymentMethod);
    } else {
      return res.status(404).json({ message: 'Payment method not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving payment method: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const detachPaymentMethod = async (req: Request, res: Response) => {
  const { paymentMethodId } = req.params;
  try {
    const stripePaymentMethodService =
      StripePaymentMethodService.retrieveServiceInstance();
    const detachedPaymentMethod =
      await stripePaymentMethodService.detachPaymentMethod(paymentMethodId, {
        stripeAccount: req.headers['stripe-account'] as string,
      });

    if (detachedPaymentMethod) {
      return res.status(200).json(detachedPaymentMethod);
    } else {
      return res.status(404).json({
        message: 'Payment method not found or could not be detached.',
      });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error detaching payment method: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
