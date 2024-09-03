import { Router } from 'express';
import {
  addSubscriptions,
  removeSubscription,
} from '../../controllers/billing.subscription.sync.controller';

const router = Router();

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Add a list of subscriptions
 *     description: Adds multiple subscriptions to the database. Expects an array of subscription objects in the request body.
 *     tags:
 *       - Subscriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 isActive:
 *                   type: boolean
 *                   description: Indicates if the subscription is active
 *                 participantId:
 *                   type: string
 *                   description: The ID of the participant associated with the subscription
 *                 subscriptionType:
 *                   type: string
 *                   enum: [limitDate, payAmount, usageCount]
 *                   description: The type of subscription
 *                 resourceId:
 *                   type: string
 *                   description: The ID of the associated resource (optional)
 *                 resourceIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of associated resource IDs (optional)
 *                 details:
 *                   type: object
 *                   description: Detailed information about the subscription
 *                   properties:
 *                     limitDate:
 *                       type: string
 *                       format: date-time
 *                       description: The limit date for the subscription (optional)
 *                     payAmount:
 *                       type: number
 *                       description: The amount paid for the subscription (optional)
 *                     usageCount:
 *                       type: number
 *                       description: The count of usage for the subscription (optional)
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       description: The start date of the subscription
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       description: The end date of the subscription
 *             example:
 *               - isActive: true
 *                 participantId: "12345"
 *                 subscriptionType: "limitDate"
 *                 resourceId: "abcde"
 *                 resourceIds: ["abcde", "fghij"]
 *                 details:
 *                   limitDate: "2024-12-31T23:59:59Z"
 *                   startDate: "2024-01-01T00:00:00Z"
 *                   endDate: "2024-12-31T23:59:59Z"
 *               - isActive: false
 *                 participantId: "67890"
 *                 subscriptionType: "payAmount"
 *                 details:
 *                   payAmount: 99.99
 *                   startDate: "2024-01-01T00:00:00Z"
 *                   endDate: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Subscriptions added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the created subscription
 *                   isActive:
 *                     type: boolean
 *                   participantId:
 *                     type: string
 *                   subscriptionType:
 *                     type: string
 *                   resourceId:
 *                     type: string
 *                   resourceIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   details:
 *                     type: object
 *                     properties:
 *                       limitDate:
 *                         type: string
 *                         format: date-time
 *                       payAmount:
 *                         type: number
 *                       usageCount:
 *                         type: number
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input, expected an array of subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input, expected an array of subscriptions
 *       500:
 *         description: Error adding subscriptions or service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error adding subscriptions
 *                 error:
 *                   type: string
 */
router.post('/subscriptions', addSubscriptions);

/**
 * @swagger
 * /subscriptions/{subscriptionId}:
 *   delete:
 *     summary: Remove a subscription
 *     description: Deletes a subscription from the database based on the provided subscription ID.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subscription to be deleted
 *     responses:
 *       200:
 *         description: Subscription removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription removed successfully
 *                 subscription:
 *                   type: object
 *                   description: The details of the removed subscription
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the removed subscription
 *                     isActive:
 *                       type: boolean
 *                     participantId:
 *                       type: string
 *                     subscriptionType:
 *                       type: string
 *                     resourceId:
 *                       type: string
 *                     resourceIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                     details:
 *                       type: object
 *                       properties:
 *                         limitDate:
 *                           type: string
 *                           format: date-time
 *                         payAmount:
 *                           type: number
 *                         usageCount:
 *                           type: number
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription not found
 *       500:
 *         description: Error removing subscription or service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error removing subscription
 *                 error:
 *                   type: string
 */
router.delete('/subscriptions/:subscriptionId', removeSubscription);

export default router;
