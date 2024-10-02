import { Router } from 'express';
import {
    getConnectedAccountByConnectedAccountId,
    getConnectedAccountById,
    getConnectedAccountByParticipantId,
    getConnectedAccounts
} from "../../controllers/billing.connected.account.controller";

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
 * /api/connected-accounts/participant/{participantId}:
 *   get:
 *     summary: Retrieve a billing connected account by participantId
 *     description: Retrieve a billing connected account by participantId.
 *     tags:
 *       - Connected Accounts
 *     parameters:
 *       - name: participantId
 *         in: path
 *         required: true
 *         description: The participantId of the billing connected account.
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
router.get('/participant/:participantId', getConnectedAccountByParticipantId);

/**
 * @swagger
 * /api/connected-accounts/connected-account/{connectedAccountId}:
 *   get:
 *     summary: Retrieve a billing connected account by connectedAccountId
 *     description: Retrieve a billing connected account by connectedAccountId.
 *     tags:
 *       - Connected Accounts
 *     parameters:
 *       - name: connectedAccountId
 *         in: path
 *         required: true
 *         description: The customerId of the billing connected account.
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
router.get('/connected-account/:connectedAccountId', getConnectedAccountByConnectedAccountId);


export default router;
