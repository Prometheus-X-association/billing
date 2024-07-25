import { Request, Response } from 'express';
import BillingSubscriptionSyncService from '../services/BillingSubscriptionSyncService';

const billingSubscriptionSyncService = (async () => {
  try {
    const service = await BillingSubscriptionSyncService.getService();
    console.log('Billing Subscription Sync Service initialized');
    return service;
  } catch (error) {
    console.error('Failed to create instance:', error);
    return undefined;
  }
})();

export const addSubscriptions = async (req: Request, res: Response) => {
  try {
    const service = await billingSubscriptionSyncService;
    if (!service) {
      return res.status(500).json({ message: 'Service unavailable' });
    }
    const subscriptions = req.body;
    if (!Array.isArray(subscriptions)) {
      return res
        .status(400)
        .json({ message: 'Invalid input: expected an array of subscriptions' });
    }
    const result = await service.addSubscriptions(subscriptions);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding subscriptions', error });
  }
};

export const removeSubscription = async (req: Request, res: Response) => {
  try {
    const service = await billingSubscriptionSyncService;
    if (!service) {
      return res.status(500).json({ message: 'Service unavailable' });
    }
    const { subscriptionId } = req.params;
    const result = await service.removeSubscription(subscriptionId);
    if (result) {
      res.status(200).json({
        message: 'Subscription removed successfully',
        subscription: result,
      });
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing subscription', error });
  }
};
