import { Router } from 'express';
import {
  getParticipantSubscriptions,
  getResourceSubscription,
  getGroupSubscription,
  getSubscriptionDateTime,
  getSubscriptionPayAmount,
  getSubscriptionUsageCount,
  getAllSubscriptions,
} from '../controllers/billing.subscription.controller';

const router = Router();

router.get(
  '/subscriptions/for/participant/:participantId',
  getParticipantSubscriptions,
);
router.get(
  '/subscriptions/for/resource/:participantId/:resourceId',
  getResourceSubscription,
);
router.get(
  '/subscriptions/group/for/resource/:participantId/:resourceId',
  getGroupSubscription,
);
router.get(
  '/subscriptions/datetime/for/resource/:participantId/:resourceId',
  getSubscriptionDateTime,
);
router.get(
  '/subscriptions/pay/for/resource/:participantId/:resourceId',
  getSubscriptionPayAmount,
);
router.get(
  '/subscriptions/usage/for/resource/:participantId/:resourceId',
  getSubscriptionUsageCount,
);
router.get('/subscriptions', getAllSubscriptions);

export default router;
