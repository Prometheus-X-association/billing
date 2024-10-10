import { Request, Response } from 'express';
import SubscriptionService from '../services/BillingSubscriptionService';

const BillingSubscriptionService =
  SubscriptionService.retrieveServiceInstance();

export const getParticipantSubscriptions = (req: Request, res: Response) => {
  try {
    const { participant } = req.params;
    const subscriptions =
      BillingSubscriptionService.getParticipantSubscriptions(participant);
    res.status(200).json(subscriptions ?? []);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving participant subscriptions', error });
  }
};

export const getParticipantResourceSubscriptions = (
  req: Request,
  res: Response,
) => {
  try {
    const { participant, resource } = req.params;
    const subscriptions =
      BillingSubscriptionService.getParticipantResourceSubscriptions(
        participant,
        resource,
      );
    res.status(200).json(subscriptions ?? []);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving participant resource subscriptions',
      error,
    });
  }
};

export const getLimitDateSubscriptions = (req: Request, res: Response) => {
  try {
    const { participant, resource } = req.params;
    const subscriptions = BillingSubscriptionService.getLimitDateSubscriptions(
      participant,
      resource,
    );
    res.status(200).json(subscriptions ?? []);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving limit date subscriptions', error });
  }
};

export const getPayAmountSubscriptions = (req: Request, res: Response) => {
  try {
    const { participant, resource } = req.params;
    const subscriptions = BillingSubscriptionService.getPayAmountSubscriptions(
      participant,
      resource,
    );
    res.status(200).json(subscriptions ?? []);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving pay amount subscriptions', error });
  }
};

export const getUsageCountSubscriptions = (req: Request, res: Response) => {
  try {
    const { participant, resource } = req.params;
    const subscriptions = BillingSubscriptionService.getUsageCountSubscriptions(
      participant,
      resource,
    );
    res.status(200).json(subscriptions ?? []);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving usage count subscriptions', error });
  }
};

export const getLastActiveUsageCount = (req: Request, res: Response) => {
  try {
    const { participant, resource } = req.params;
    console.log('participant', participant);
    console.log('resource', resource);
    const usageCount = BillingSubscriptionService.getLastActiveUsageCount(
      participant,
      resource,
    );
    res.status(200).json(usageCount ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving last active usage count', error });
  }
};

export const getLastActivePayAmount = (req: Request, res: Response) => {
  try {
    const { participant, resource } = req.params;
    const payAmount = BillingSubscriptionService.getLastActivePayAmount(
      participant,
      resource,
    );
    res.status(200).json(payAmount ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving last active pay amount', error });
  }
};

export const getLastActiveLimitDate = (req: Request, res: Response) => {
  try {
    const { participant, resource } = req.params;
    const limitDate = BillingSubscriptionService.getLastActiveLimitDate(
      participant,
      resource,
    );
    res.status(200).json(limitDate ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving last active limit date', error });
  }
};

export const getValidActiveUsageCountSubscriptions = (
  req: Request,
  res: Response,
) => {
  try {
    const { participant, resource } = req.params;
    const usageCount =
      BillingSubscriptionService.getValidActiveUsageCountSubscriptions(
        participant,
        resource,
      );
    res.status(200).json(usageCount ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving last active usage count', error });
  }
};

export const getValidActivePayAmountSubscriptions = (
  req: Request,
  res: Response,
) => {
  try {
    const { participant, resource } = req.params;
    const payAmount =
      BillingSubscriptionService.getValidActivePayAmountSubscriptions(
        participant,
        resource,
      );
    res.status(200).json(payAmount ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving last active pay amount', error });
  }
};

export const getValidActiveLimitDateSubscriptions = (
  req: Request,
  res: Response,
) => {
  try {
    const { participant, resource } = req.params;
    const limitDate =
      BillingSubscriptionService.getValidActiveLimitDateSubscriptions(
        participant,
        resource,
      );
    res.status(200).json(limitDate ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving last active usage count', error });
  }
};

export const hasActiveSubscriptionFor = (req: Request, res: Response) => {
  try {
    const { participant, resource } = req.params;
    const hasActiveSubscription =
      BillingSubscriptionService.hasActiveSubscriptionFor(
        participant,
        resource,
      );
    res.status(200).json({ hasActiveSubscription });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error checking active subscription', error });
  }
};

export const getAllSubscriptions = (_req: Request, res: Response) => {
  try {
    const subscriptions = BillingSubscriptionService.getAllSubscriptions();
    res.status(200).json(subscriptions ?? []);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving all subscriptions', error });
  }
};
