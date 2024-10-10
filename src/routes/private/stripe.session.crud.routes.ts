import { Router } from 'express';
import {createSession} from "../../controllers/stripe.session.crud.controller";

const router = Router();

/**
 * @swagger
 * /api/stripe/session:
 *   post:
 *     summary: Create a new session
 *     description: Create a new checkout session.
 *     parameters:
 *      - name: stripe-account
 *        in: header
 *        description: stripe account
 *        required: true
 *        type: string
 *     tags: [Stripe Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode:
 *                 type: string
 *                 description: Payment - setup - subscription.
 *               line_items:
 *                 type: object
 *                 description: If provided, this value will be used when the Customer object is created.
 *               customer_email:
 *                 type: string
 *                 description: If provided, this value will be used when the Customer object is created.
 *               customer:
 *                 type: string
 *                 description: ID of an existing Customer, if one exists. In payment mode, the customer’s most recently saved card payment method will be used to prefill the email, name, card details, and billing address on the Checkout page.
 *               return_url:
 *                 type: string
 *                 description: The URL to redirect your customer back to after they authenticate or cancel their payment on the payment method’s app or site.
 *               success_url:
 *                 type: string
 *                 description: The URL to which Stripe should send customers when payment or setup is complete.
 *               metadata:
 *                 type: object
 *                 description: Additional information about the price.
 *                 example: { key: 'value' }
 *     responses:
 *       201:
 *         description: Session created successfully.
 *       500:
 *         description: Failed to create the session.
 */
router.post('/session', createSession);

export default router;
