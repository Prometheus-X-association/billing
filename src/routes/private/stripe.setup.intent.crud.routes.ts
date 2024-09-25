import { Router } from 'express';
import {
  createSetupIntent,
  updateSetupIntent,
  getSetupIntent,
  cancelSetupIntent,
  confirmSetupIntent,
} from '../../controllers/stripe.setup.intent.crud.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/setupintent:
 *   post:
 *     summary: Create a new Setup Intent
 *     description: Create a new Setup Intent in Stripe.
 *     tags:
 *       - Stripe Setup Intent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_method_types:
 *                 type: array
 *                 items:
 *                   type: string
 *               customer:
 *                 type: string
 *               usage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Setup Intent created successfully.
 *       500:
 *         description: Failed to create setup intent.
 */
router.post('/setupintent', createSetupIntent);

/**
 * @swagger
 * /api/stripe/setupintent/{setupIntentId}:
 *   put:
 *     summary: Update a Setup Intent
 *     description: Update an existing Setup Intent in Stripe.
 *     tags:
 *       - Stripe Setup Intent
 *     parameters:
 *       - name: setupIntentId
 *         in: path
 *         required: true
 *         description: The ID of the Setup Intent to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       200:
 *         description: Setup Intent updated successfully.
 *       404:
 *         description: Setup Intent not found or could not be updated.
 *       500:
 *         description: Error updating Setup Intent.
 */
router.put('/setupintent/:setupIntentId', updateSetupIntent);

/**
 * @swagger
 * /api/stripe/setupintent/{setupIntentId}:
 *   get:
 *     summary: Retrieve a Setup Intent
 *     description: Get details of a specific Setup Intent by its ID from Stripe.
 *     tags:
 *       - Stripe Setup Intent
 *     parameters:
 *       - name: setupIntentId
 *         in: path
 *         required: true
 *         description: The ID of the Setup Intent to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setup Intent retrieved successfully.
 *       404:
 *         description: Setup Intent not found.
 *       500:
 *         description: Error retrieving Setup Intent.
 */
router.get('/setupintent/:setupIntentId', getSetupIntent);

/**
 * @swagger
 * /api/stripe/setupintent/{setupIntentId}:
 *   delete:
 *     summary: Cancel a Setup Intent
 *     description: Cancel a specific Setup Intent by its ID.
 *     tags:
 *       - Stripe Setup Intent
 *     parameters:
 *       - name: setupIntentId
 *         in: path
 *         required: true
 *         description: The ID of the Setup Intent to cancel.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setup Intent canceled successfully.
 *       404:
 *         description: Setup Intent not found or could not be canceled.
 *       500:
 *         description: Error canceling Setup Intent.
 */
router.delete('/setupintent/:setupIntentId', cancelSetupIntent);

/**
 * @swagger
 * /api/stripe/setupintent/{setupIntentId}/confirm:
 *   post:
 *     summary: Confirm a Setup Intent
 *     description: Confirm a specific Setup Intent by its ID.
 *     tags:
 *       - Stripe Setup Intent
 *     parameters:
 *       - name: setupIntentId
 *         in: path
 *         required: true
 *         description: The ID of the Setup Intent to confirm.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_method:
 *                 type: string
 *     responses:
 *       200:
 *         description: Setup Intent confirmed successfully.
 *       404:
 *         description: Setup Intent not found or could not be confirmed.
 *       500:
 *         description: Error confirming Setup Intent.
 */
router.post('/setupintent/:setupIntentId/confirm', confirmSetupIntent);

export default router;
