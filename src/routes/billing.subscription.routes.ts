import { Router } from 'express';
import {
  getParticipantSubscriptions,
  getParticipantResourceSubscriptions,
  getLimitDateSubscriptions,
  getPayAmountSubscriptions,
  getUsageCountSubscriptions,
  getLastActiveUsageCount,
  getLastActivePayAmount,
  getLastActiveLimitDate,
  hasActiveSubscriptionFor,
  getAllSubscriptions,
} from '../controllers/billing.subscription.controller';

const router = Router();

router.get(
  '/subscriptions/for/participant/:participantId',
  getParticipantSubscriptions,
);

router.get(
  '/subscriptions/for/resource/:participantId/:resourceId',
  getParticipantResourceSubscriptions,
);

router.get(
  '/subscriptions/limitdate/for/resource/:participantId/:resourceId',
  getLimitDateSubscriptions,
);

router.get(
  '/subscriptions/pay/for/resource/:participantId/:resourceId',
  getPayAmountSubscriptions,
);

router.get(
  '/subscriptions/usage/for/resource/:participantId/:resourceId',
  getUsageCountSubscriptions,
);

router.get(
  '/subscriptions/lastactive/usage/for/resource/:participantId/:resourceId',
  getLastActiveUsageCount,
);

router.get(
  '/subscriptions/lastactive/pay/for/resource/:participantId/:resourceId',
  getLastActivePayAmount,
);

router.get(
  '/subscriptions/lastactive/limitdate/for/resource/:participantId/:resourceId',
  getLastActiveLimitDate,
);

router.get(
  '/subscriptions/hasactive/for/resource/:participantId/:resourceId',
  hasActiveSubscriptionFor,
);

router.get('/subscriptions', getAllSubscriptions);

export default router;
