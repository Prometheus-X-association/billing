import { Router } from 'express';
import {
  addSubscriptions,
  removeSubscription,
} from '../controllers/billing.subscription.sync.controller';

const router = Router();

router.post('/sync/subscriptions', addSubscriptions);
router.delete('/sync/subscriptions/:subscriptionId', removeSubscription);

export default router;
