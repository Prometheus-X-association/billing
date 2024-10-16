import { Router } from 'express';
import { createToken } from "../../controllers/stripe.token.crud.controller";

const router = Router();

/**
 * @swagger
 * /api/stripe/token:
 *   post:
 *     summary: Create a new token
 *     description: This endpoint allows you to create a new token.
 *     tags:
 *       - Stripe Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:
 *                 type: object
 *                 properties:
 *                  business_type:
 *                    type: string
 *                    description: The business type - company, government_entity, individual, non_profit.
 *                    required: false
 *                  company:
 *                    type: string
 *                    description: The bank account this token will represent.
 *                  individual:
 *                    type: string
 *                    description: The bank account this token will represent.
 *                  tos_shown_and_accepted:
 *                    type: string
 *                    description: The bank account this token will represent.
 *                 description: Information for the account this token represents.
 *               bank_account:
 *                 type: string
 *                 description: The bank account this token will represent.
 *               card:
 *                 type: string
 *                 description: The card this token will represent.
 *               customer:
 *                 type: string
 *                 description: Create a token for the customer, which is owned by the application's account.
 *               cvc_update:
 *                 type: object
 *                 description: The updated CVC value this token represents.
 *                 properties:
 *                  cvc:
 *                    type: string
 *                    description: The CVC value, in string form.
 *                    required: false
 *               expand:
 *                 type: string
 *                 description: Specifies which fields in the response should be expanded.
 *                 required: false
 *               person:
 *                 type: string
 *                 description: Information for the person this token represents.
 *               pii:
 *                 type: object
 *                 description: The PII this token represents.
 *                 properties:
 *                  id_number:
 *                    type: string
 *                    description: The id_number for the PII, in string form.
 *                    required: false
 *     responses:
 *       201:
 *         description: Successfully created a new account token.
 *       500:
 *         description: Failed to create account token.
 */
router.post('/token', createToken);

export default router;
