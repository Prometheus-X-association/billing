import { Router } from 'express';
import {
  confirmPaymentIntent,
  createPaymentIntent,
  getPaymentIntent,
  updatePaymentIntent,
} from '../../controllers/stripe.payment.intent.controller';

const router = Router();

router.post('/payment_intents', createPaymentIntent);
router.post('/payment_intents/:paymentIntentId', updatePaymentIntent);
router.get('/payment_intents/:paymentIntentId', getPaymentIntent);
router.post('/payment_intents/:paymentIntentId/confirm', confirmPaymentIntent);

export default router;
