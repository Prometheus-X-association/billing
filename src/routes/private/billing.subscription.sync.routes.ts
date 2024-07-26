import { Router } from 'express';
import {
  addSubscriptions,
  removeSubscription,
} from '../../controllers/billing.subscription.sync.controller';

const router = Router();

router.post('/subscriptions', addSubscriptions);
router.delete('/subscriptions/:subscriptionId', removeSubscription);

export default router;
