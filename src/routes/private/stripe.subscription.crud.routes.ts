import { Router } from 'express';
import {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getAllSubscriptions,
} from '../../controllers/stripe.subscription.crud.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     description: Creates a subscription for a customer using their customerId and priceId.
 *     parameters:
 *      - name: stripe-account
 *        in: header
 *        description: stripe account
 *        required: true
 *        type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: The ID of the customer.
 *               priceId:
 *                 type: string
 *                 description: The ID of the price.
 *     responses:
 *       201:
 *         description: Subscription created successfully.
 *       400:
 *         description: customerId and priceId are required.
 *       500:
 *         description: Internal server error.
 */
router.post('/subscriptions', createSubscription);

/**
 * @swagger
 * /api/stripe/subscriptions:
 *   get:
 *     summary: Retrieve all subscriptions
 *     description: Fetches all the existing subscriptions.
 *     responses:
 *       200:
 *         description: A list of subscriptions.
 *       404:
 *         description: No subscriptions found.
 *       500:
 *         description: Internal server error.
 */
router.get('/subscriptions', getAllSubscriptions);

/**
 * @swagger
 * /api/stripe/subscriptions/{subscriptionId}:
 *   get:
 *     summary: Retrieve a specific subscription
 *     description: Fetches details of a subscription by its ID.
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subscription.
 *     responses:
 *       200:
 *         description: Subscription details.
 *       404:
 *         description: Subscription not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/subscriptions/:subscriptionId', getSubscription);

/**
 * @swagger
 * /api/stripe/subscriptions/{subscriptionId}:
 *   put:
 *     summary: Update a specific subscription
 *     description: Updates details of an existing subscription using its ID.
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subscription to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update for the subscription.
 *     responses:
 *       200:
 *         description: Subscription updated successfully.
 *       404:
 *         description: Subscription not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/subscriptions/:subscriptionId', updateSubscription);

/**
 * @swagger
 * /api/stripe/subscriptions/{subscriptionId}:
 *   delete:
 *     summary: Cancel a subscription
 *     description: Cancels an existing subscription using its ID.
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subscription to be canceled.
 *     responses:
 *       200:
 *         description: Subscription canceled successfully.
 *       404:
 *         description: Subscription not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/subscriptions/:subscriptionId', cancelSubscription);

export default router;
