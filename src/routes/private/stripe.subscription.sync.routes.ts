import express, { Router } from 'express';
import {
  handleStripeWebhook,
  linkParticipantToCustomer,
  unlinkParticipantFromCustomer,
} from '../../controllers/stripe.subscription.sync.controller';

const router = Router();

/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     description: This endpoint receives and processes webhook events from Stripe. It verifies the Stripe signature and processes events like customer subscription updates, deletions, and creations.
 *     tags:
 *       - Stripe Webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe event payload sent as JSON.
 *     responses:
 *       200:
 *         description: Webhook event received and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error processing the webhook event (e.g., invalid signature or unhandled event)
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Webhook Error: Missing 'Stripe-Signature' header"
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

/**
 * @swagger
 * /link:
 *   post:
 *     summary: Link a participant to a Stripe customer
 *     description: Establish a mapping between a participantId from your system and a customerId from Stripe.
 *     tags:
 *       - Participant-Customer Mapping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: The ID of the participant in the internal system.
 *                 example: "12345"
 *               customerId:
 *                 type: string
 *                 description: The Stripe customer ID.
 *                 example: "customer_6789"
 *     responses:
 *       200:
 *         description: Link established successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Link established successfully"
 *       400:
 *         description: Missing participantId or customerId in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "participantId and customerId are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error linking participant to customer"
 *                 error:
 *                   type: string
 */
router.post('/link', linkParticipantToCustomer);

/**
 * @swagger
 * /unlink/{customerId}:
 *   delete:
 *     summary: Unlink a participant from a Stripe customer
 *     description: Remove the mapping between a participantId and a Stripe customerId.
 *     tags:
 *       - Participant-Customer Mapping
 *     parameters:
 *       - in: path
 *         name: customerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The Stripe customer ID to be unlinked.
 *         example: "customer_6789"
 *     responses:
 *       200:
 *         description: Link removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Link removed successfully"
 *       400:
 *         description: Missing customerId in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "customerId is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error unlinking participant from customer"
 *                 error:
 *                   type: string
 */
router.delete('/unlink/:customerId', unlinkParticipantFromCustomer);

export default router;
