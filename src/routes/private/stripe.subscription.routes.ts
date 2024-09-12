import express, { Router } from 'express';
import { handleStripeWebhook } from '../../controllers/stripe.subscription.controller';

const router = Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

export default router;
