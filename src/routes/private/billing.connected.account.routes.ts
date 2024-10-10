import { Router } from 'express';
import {
    getConnectedAccountByStripeAccount,
    getConnectedAccountById,
    getConnectedAccountByParticipant,
    getConnectedAccounts
} from "../../controllers/billing.connected.account.controller";
import { base64Checker } from '../middlewares/base64Checker';

const router = Router();

/**
 * @swagger
 * /api/connected-accounts/:
 *   get:
 *     summary: Retrieve all billing connected account
 *     description: Retrieve all billing connected account.
 *     tags:
 *       - Connected Accounts
 *     responses:
 *       200:
 *         description: Successfully retrieved the connected account.
 *       404:
 *         description: Connected account not found.
 *       500:
 *         description: Error retrieving connected account.
 */
router.get('/', getConnectedAccounts);

/**
 * @swagger
 * /api/connected-accounts/{id}:
 *   get:
 *     summary: Retrieve a billing connected account
 *     description: Retrieve a billing connected account.
 *     tags:
 *       - Connected Accounts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the billing connected account.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the connected account.
 *       404:
 *         description: Connected account not found.
 *       500:
 *         description: Error retrieving connected account.
 */
router.get('/:id', getConnectedAccountById);

/**
 * @swagger
 * /api/connected-accounts/participant/{participant}:
 *   get:
 *     summary: Retrieve a billing connected account by participant
 *     description: Retrieve a billing connected account by participant.
 *     tags:
 *       - Connected Accounts
 *     parameters:
 *       - name: participant
 *         in: path
 *         required: true
 *         description: The participant of the billing connected account.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the connected account.
 *       404:
 *         description: Connected account not found.
 *       500:
 *         description: Error retrieving connected account.
 */
router.get('/participant/:participant', base64Checker('participant'), getConnectedAccountByParticipant);

/**
 * @swagger
 * /api/connected-accounts/connected-account/{stripeAccount}:
 *   get:
 *     summary: Retrieve a billing connected account by stripeAccount
 *     description: Retrieve a billing connected account by stripeAccount.
 *     tags:
 *       - Connected Accounts
 *     parameters:
 *       - name: stripeAccount
 *         in: path
 *         required: true
 *         description: The stripe Account.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the connected account.
 *       404:
 *         description: Connected account not found.
 *       500:
 *         description: Error retrieving connected account.
 */
router.get('/connected-account/:stripeAccount', getConnectedAccountByStripeAccount);

export default router;
