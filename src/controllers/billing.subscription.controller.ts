import { Request, Response } from 'express';
import SubscriptionService from '../services/BillingSubscriptionService';

const BillingSubscriptionService = SubscriptionService.getService();

export const getParticipantSubscriptions = (req: Request, res: Response) => {
  try {
    const { participantId } = req.params;
    const subscriptions =
      BillingSubscriptionService.getParticipantSubscriptions(participantId);
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
    const { participantId, resourceId } = req.params;
    const subscriptions =
      BillingSubscriptionService.getParticipantResourceSubscriptions(
        participantId,
        resourceId,
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
    const { participantId, resourceId } = req.params;
    const subscriptions = BillingSubscriptionService.getLimitDateSubscriptions(
      participantId,
      resourceId,
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
    const { participantId, resourceId } = req.params;
    const subscriptions = BillingSubscriptionService.getPayAmountSubscriptions(
      participantId,
      resourceId,
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
    const { participantId, resourceId } = req.params;
    const subscriptions = BillingSubscriptionService.getUsageCountSubscriptions(
      participantId,
      resourceId,
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
    const { participantId, resourceId } = req.params;
    const usageCount = BillingSubscriptionService.getLastActiveUsageCount(
      participantId,
      resourceId,
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
    const { participantId, resourceId } = req.params;
    const payAmount = BillingSubscriptionService.getLastActivePayAmount(
      participantId,
      resourceId,
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
    const { participantId, resourceId } = req.params;
    const limitDate = BillingSubscriptionService.getLastActiveLimitDate(
      participantId,
      resourceId,
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
    const { participantId, resourceId } = req.params;
    const usageCount =
      BillingSubscriptionService.getValidActiveUsageCountSubscriptions(
        participantId,
        resourceId,
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
    const { participantId, resourceId } = req.params;
    const payAmount =
      BillingSubscriptionService.getValidActivePayAmountSubscriptions(
        participantId,
        resourceId,
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
    const { participantId, resourceId } = req.params;
    const limitDate =
      BillingSubscriptionService.getValidActiveLimitDateSubscriptions(
        participantId,
        resourceId,
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
    const { participantId, resourceId } = req.params;
    const hasActiveSubscription =
      BillingSubscriptionService.hasActiveSubscriptionFor(
        participantId,
        resourceId,
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
