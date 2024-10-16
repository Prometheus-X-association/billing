import express, { Router } from 'express';
import {
  handleStripeWebhook, linkParticipantToConnectedAccount,
  linkParticipantToCustomer, unlinkParticipantFromConnectedAccount,
  unlinkParticipantFromCustomer,
} from '../../controllers/stripe.subscription.sync.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/webhook:
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
 * /api/stripe/link/customer:
 *   post:
 *     summary: Link a participant to a Stripe customer
 *     description: Establish a mapping between a participant from your system and a stripe customer from Stripe.
 *     tags:
 *       - Participant-Customer Mapping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participant:
 *                 type: string
 *                 description: The ID of the participant in the internal system.
 *                 example: "12345"
 *               stripeCustomerId:
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
 *         description: Missing participant or stripeCustomerId in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "participant and stripeCustomerId are required"
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
router.post('/link/customer', linkParticipantToCustomer);

/**
 * @swagger
 * /api/stripe/link/connect:
 *   post:
 *     summary: Link a participant to a Stripe connected account
 *     description: Establish a mapping between a participant from your system and a connected Account from Stripe.
 *     tags:
 *       - Participant-ConnectedAccount Mapping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participant:
 *                 type: string
 *                 description: The ID of the participant in the internal system.
 *                 example: "12345"
 *               stripeAccount:
 *                 type: string
 *                 description: The Stripe account.
 *                 example: "acc_6789"
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
 *         description: Missing participant or stripeAccount in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "participant and stripeAccount are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error linking participant to connected account"
 *                 error:
 *                   type: string
 */
router.post('/link/connect', linkParticipantToConnectedAccount);

/**
 * @swagger
 * /api/stripe/unlink/customer/{customerId}:
 *   delete:
 *     summary: Unlink a participant from a Stripe customer
 *     description: Remove the mapping between a participant and a Stripe customer.
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
 *                   example: "Error unlinking participant from connected account"
 *                 error:
 *                   type: string
 */
router.delete('/unlink/customer/:customerId', unlinkParticipantFromCustomer);

/**
 * @swagger
 * /api/stripe/unlink/connect/{stripeAccount}:
 *   delete:
 *     summary: Unlink a participant from a Stripe connected Account
 *     description: Remove the mapping between a participant and a Stripe stripeAccount.
 *     tags:
 *       - Participant-ConnectedAccount Mapping
 *     parameters:
 *       - in: path
 *         name: stripeAccount
 *         schema:
 *           type: string
 *         required: true
 *         description: The stripe Account.
 *         example: "acct_6789"
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
 *         description: Missing stripeAccount in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "stripeAccount is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error unlinking participant from connected account"
 *                 error:
 *                   type: string
 */
router.delete('/unlink/connect/:stripeAccount', unlinkParticipantFromConnectedAccount);

export default router;
