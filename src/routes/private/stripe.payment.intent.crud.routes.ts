import { Router } from 'express';
import {
  confirmPaymentIntent,
  createPaymentIntent,
  getPaymentIntent,
  updatePaymentIntent,
} from '../../controllers/stripe.payment.intent.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/payment_intents:
 *   post:
 *     summary: Create a new payment intent in Stripe
 *     description: This endpoint allows you to create a new payment intent for processing a payment with the specified parameters.
 *     tags:
 *       - Stripe Payment Intent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: The amount to be charged in the smallest currency unit (e.g., cents for USD).
 *               currency:
 *                 type: string
 *                 description: The currency in which to charge the payment (e.g., 'usd').
 *     responses:
 *       201:
 *         description: Successfully created a new payment intent.
 *       500:
 *         description: Failed to create payment intent.
 */
router.post('/payment_intents', createPaymentIntent);

/**
 * @swagger
 * /api/stripe/payment_intents/{paymentIntentId}:
 *   post:
 *     summary: Update an existing payment intent by ID
 *     description: Update the details of a specific payment intent using the payment intent ID.
 *     tags:
 *       - Stripe Payment Intent
 *     parameters:
 *       - name: paymentIntentId
 *         in: path
 *         required: true
 *         description: The ID of the payment intent to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: The new amount to charge.
 *               metadata:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 description: Additional metadata for the payment intent.
 *     responses:
 *       200:
 *         description: Successfully updated the payment intent.
 *       404:
 *         description: Payment intent not found.
 *       500:
 *         description: Error updating payment intent.
 */
router.post('/payment_intents/:paymentIntentId', updatePaymentIntent);

/**
 * @swagger
 * /api/stripe/payment_intents/{paymentIntentId}:
 *   get:
 *     summary: Retrieve a payment intent by ID
 *     description: Retrieve a specific payment intent from Stripe using the payment intent ID.
 *     tags:
 *       - Stripe Payment Intent
 *     parameters:
 *       - name: paymentIntentId
 *         in: path
 *         required: true
 *         description: The ID of the payment intent to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the payment intent.
 *       404:
 *         description: Payment intent not found.
 *       500:
 *         description: Error retrieving payment intent.
 */
router.get('/payment_intents/:paymentIntentId', getPaymentIntent);

/**
 * @swagger
 * /api/stripe/payment_intents/{paymentIntentId}/confirm:
 *   post:
 *     summary: Confirm a payment intent by ID
 *     description: Confirm the payment intent to complete the payment process.
 *     tags:
 *       - Stripe Payment Intent
 *     parameters:
 *       - name: paymentIntentId
 *         in: path
 *         required: true
 *         description: The ID of the payment intent to confirm.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_method:
 *                 type: string
 *                 description: The ID of the payment method to confirm the payment intent with.
 *     responses:
 *       200:
 *         description: Successfully confirmed the payment intent.
 *       404:
 *         description: Payment intent not found.
 *       500:
 *         description: Error confirming payment intent.
 */
router.post('/payment_intents/:paymentIntentId/confirm', confirmPaymentIntent);

export default router;
