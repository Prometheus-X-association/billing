import { Router } from 'express';
import {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
} from '../../controllers/stripe.subscription.crud.controller';

const router = Router();

router.post('/subscriptions', createSubscription);
router.get('/subscriptions/:subscriptionId', getSubscription);
router.put('/subscriptions/:subscriptionId', updateSubscription);
router.delete('/subscriptions/:subscriptionId', cancelSubscription);

export default router;
