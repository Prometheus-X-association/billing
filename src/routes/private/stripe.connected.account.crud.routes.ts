import { Router } from 'express';
import {
  createConnectedAccount,
  createLoginLink,
  deleteConnectedAccount,
  getConnectedAccount,
  updateConnectedAccount,
} from '../../controllers/stripe.connected.account.crud.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/accounts:
 *   post:
 *     summary: Create a new connected Stripe account
 *     description: This endpoint allows you to create a new Stripe connected account.
 *     tags:
 *       - Stripe Connected Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the connected account.
 *     responses:
 *       201:
 *         description: Successfully created a new connected account.
 *       500:
 *         description: Failed to create connected account.
 */
router.post('/accounts', createConnectedAccount);

/**
 * @swagger
 * /api/stripe/accounts/{accountId}:
 *   post:
 *     summary: Update an existing connected Stripe account
 *     description: Update details of an existing Stripe connected account by its ID.
 *     tags:
 *       - Stripe Connected Account
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the Stripe account to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: New email for the account.
 *     responses:
 *       200:
 *         description: Successfully updated the connected account.
 *       404:
 *         description: Connected account not found.
 *       500:
 *         description: Error updating connected account.
 */
router.post('/accounts/:accountId', updateConnectedAccount);

/**
 * @swagger
 * /api/stripe/accounts/{accountId}:
 *   get:
 *     summary: Retrieve details of a connected Stripe account
 *     description: Get the details of a specific connected Stripe account by its ID.
 *     tags:
 *       - Stripe Connected Account
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the Stripe account to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the connected account details.
 *       404:
 *         description: Connected account not found.
 *       500:
 *         description: Error retrieving connected account.
 */
router.get('/accounts/:accountId', getConnectedAccount);

/**
 * @swagger
 * /api/stripe/accounts/{accountId}:
 *   delete:
 *     summary: Delete a connected Stripe account
 *     description: Delete an existing connected Stripe account by its ID.
 *     tags:
 *       - Stripe Connected Account
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the Stripe account to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connected account deleted successfully.
 *       404:
 *         description: Connected account not found.
 *       500:
 *         description: Error deleting connected account.
 */
router.delete('/accounts/:accountId', deleteConnectedAccount);

/**
 * @swagger
 * /api/stripe/accounts/{accountId}/login_links:
 *   post:
 *     summary: Create a login link for a connected Stripe account
 *     description: Generate a login link for a specific connected Stripe account.
 *     tags:
 *       - Stripe Connected Account
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the Stripe account for which the login link will be generated.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Login link generated successfully.
 *       404:
 *         description: Failed to create login link for the account.
 *       500:
 *         description: Error creating login link.
 */
router.post('/accounts/:accountId/login_links', createLoginLink);

export default router;
