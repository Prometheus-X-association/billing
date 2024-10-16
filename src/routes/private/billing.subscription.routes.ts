import { Router } from 'express';
import {
  getParticipantSubscriptions,
  getParticipantResourceSubscriptions,
  getLimitDateSubscriptions,
  getPayAmountSubscriptions,
  getUsageCountSubscriptions,
  getLastActiveUsageCount,
  getLastActivePayAmount,
  getLastActiveLimitDate,
  hasActiveSubscriptionFor,
  getAllSubscriptions,
  getValidActivePayAmountSubscriptions,
  getValidActiveUsageCountSubscriptions,
  getValidActiveLimitDateSubscriptions,
} from '../../controllers/billing.subscription.controller';
import { base64Checker } from '../middlewares/base64Checker';

const router = Router();

/**
 * @swagger
 * /api/subscriptions/for/participant/{participant}:
 *   get:
 *     summary: Get subscriptions for a participant
 *     description: Retrieve all subscriptions for a specific participant.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant to retrieve subscriptions for.
 *     responses:
 *       200:
 *         description: Successfully retrieved subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Error retrieving participant subscriptions
 */
router.get(
  '/subscriptions/for/participant/:participant',
  base64Checker('participant'),
  getParticipantSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get subscriptions for a participant's resource
 *     description: Retrieve all subscriptions for a participant's specific resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved resource subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Error retrieving resource subscriptions
 */
router.get(
  '/subscriptions/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getParticipantResourceSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/limitdate/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get limitDate subscriptions for a resource
 *     description: Retrieve all subscriptions of type limitDate for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved limitDate subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Error retrieving limitDate subscriptions
 */
router.get(
  '/subscriptions/limitdate/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getLimitDateSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/pay/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get payAmount subscriptions for a resource
 *     description: Retrieve all subscriptions of type payAmount for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved payAmount subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Error retrieving payAmount subscriptions
 */
router.get(
  '/subscriptions/pay/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getPayAmountSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/usage/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get usageCount subscriptions for a resource
 *     description: Retrieve all subscriptions of type usageCount for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved usageCount subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Error retrieving usageCount subscriptions
 */
router.get(
  '/subscriptions/usage/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getUsageCountSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/lastactive/usage/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get last active usageCount subscription for a resource
 *     description: Retrieve the last active usageCount subscription for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved last active usageCount subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptionId:
 *                   type: string
 *                 usageCount:
 *                   type: number
 *       500:
 *         description: Error retrieving last active usageCount subscription
 */
router.get(
  '/subscriptions/lastactive/usage/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getLastActiveUsageCount,
);

/**
 * @swagger
 * /api/subscriptions/lastactive/pay/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get last active payAmount subscription for a resource
 *     description: Retrieve the last active payAmount subscription for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved last active payAmount subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptionId:
 *                   type: string
 *                 payAmount:
 *                   type: number
 *       500:
 *         description: Error retrieving last active payAmount subscription
 */
router.get(
  '/subscriptions/lastactive/pay/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getLastActivePayAmount,
);

/**
 * @swagger
 * /api/subscriptions/lastactive/limitdate/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get last active limitDate subscription for a resource
 *     description: Retrieve the last active limitDate subscription for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved last active limitDate subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptionId:
 *                   type: string
 *                 limitDate:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error retrieving last active limitDate subscription
 */
router.get(
  '/subscriptions/lastactive/limitdate/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getLastActiveLimitDate,
);

/**
 * @swagger
 * /api/subscriptions/validactive/usage/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get valid active usageCount subscriptions for a resource
 *     description: Retrieve all valid active usageCount subscriptions for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved valid active usageCount subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subscriptionId:
 *                     type: string
 *                   usageCount:
 *                     type: number
 *       500:
 *         description: Error retrieving valid active usageCount subscriptions
 */
router.get(
  '/subscriptions/validactive/usage/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getValidActiveUsageCountSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/validactive/pay/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get valid active payAmount subscriptions for a resource
 *     description: Retrieve all valid active payAmount subscriptions for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved valid active payAmount subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subscriptionId:
 *                     type: string
 *                   payAmount:
 *                     type: number
 *       500:
 *         description: Error retrieving valid active payAmount subscriptions
 */
router.get(
  '/subscriptions/validactive/pay/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getValidActivePayAmountSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/validactive/limitdate/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Get valid active limitDate subscriptions for a resource
 *     description: Retrieve all valid active limitDate subscriptions for a participant's resource.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Successfully retrieved valid active limitDate subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subscriptionId:
 *                     type: string
 *                   limitDate:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error retrieving valid active limitDate subscriptions
 */
router.get(
  '/subscriptions/validactive/limitdate/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  getValidActiveLimitDateSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/hasactive/for/resource/{participant}/{resource}:
 *   get:
 *     summary: Check if a participant has an active subscription for a specific resource
 *     description: Verifies if a participant has an active subscription for a given resource by their IDs.
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: participant
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource.
 *     responses:
 *       200:
 *         description: Returns whether the participant has an active subscription for the resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasActiveSubscription:
 *                   type: boolean
 *       404:
 *         description: Participant or resource not found
 *       500:
 *         description: Error checking active subscription
 */
router.get(
  '/subscriptions/hasactive/for/resource/:participant/:resource',
  base64Checker('participant'),
  base64Checker('resource'),
  hasActiveSubscriptionFor,
);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all subscriptions
 *     description: Retrieves a list of all subscriptions.
 *     tags:
 *       - Subscriptions
 *     responses:
 *       200:
 *         description: Successfully retrieved all subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subscriptionId:
 *                     type: string
 *                   participant:
 *                     type: string
 *                   resource:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error retrieving all subscriptions
 */
router.get('/subscriptions', getAllSubscriptions);

export default router;