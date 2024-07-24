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

export const getResourceSubscription = (req: Request, res: Response) => {
  try {
    const { participantId, resourceId } = req.params;
    const subscription = BillingSubscriptionService.getResourceSubscription(
      participantId,
      resourceId,
    );
    res.status(200).json(subscription ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving resource subscription', error });
  }
};

export const getGroupSubscription = (req: Request, res: Response) => {
  try {
    const { participantId, resourceId } = req.params;
    const subscription = BillingSubscriptionService.getGroupSubscription(
      participantId,
      resourceId,
    );
    res.status(200).json(subscription ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving group subscription', error });
  }
};

export const getSubscriptionDateTime = (req: Request, res: Response) => {
  try {
    const { participantId, resourceId } = req.params;
    const dateTime = BillingSubscriptionService.getSubscriptionDateTime(
      participantId,
      resourceId,
    );
    res.status(200).json(dateTime ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving subscription DateTime', error });
  }
};

export const getSubscriptionPayAmount = (req: Request, res: Response) => {
  try {
    const { participantId, resourceId } = req.params;
    const payAmount = BillingSubscriptionService.getSubscriptionPayAmount(
      participantId,
      resourceId,
    );
    res.status(200).json(payAmount ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving subscription pay amount', error });
  }
};

export const getSubscriptionUsageCount = (req: Request, res: Response) => {
  try {
    const { participantId, resourceId } = req.params;
    const usageCount = BillingSubscriptionService.getSubscriptionUsageCount(
      participantId,
      resourceId,
    );
    res.status(200).json(usageCount ?? {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving subscription usage count', error });
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
