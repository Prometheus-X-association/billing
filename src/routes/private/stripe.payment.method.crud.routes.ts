import { Router } from 'express';
import {
  createPaymentMethod,
  attachPaymentMethod,
  getPaymentMethod,
  detachPaymentMethod,
} from '../../controllers/stripe.payment.method.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/payment_methods:
 *   post:
 *     summary: Create a new payment method
 *     description: This endpoint allows the creation of a new payment method in Stripe with the provided parameters.
 *     tags:
 *       - Stripe Payment Method
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the payment method (e.g., 'card').
 *               card:
 *                 type: object
 *                 description: Card details for the payment method.
 *                 properties:
 *                   number:
 *                     type: string
 *                   exp_month:
 *                     type: integer
 *                   exp_year:
 *                     type: integer
 *                   cvc:
 *                     type: string
 *     responses:
 *       201:
 *         description: Successfully created the payment method.
 *       500:
 *         description: Failed to create payment method.
 */
router.post('/payment_methods', createPaymentMethod);

/**
 * @swagger
 * /api/stripe/payment_methods/{paymentMethodId}/attach:
 *   post:
 *     summary: Attach a payment method to a customer
 *     description: Attach an existing payment method to a specific customer by providing the customer ID.
 *     tags:
 *       - Stripe Payment Method
 *     parameters:
 *       - name: paymentMethodId
 *         in: path
 *         required: true
 *         description: The ID of the payment method to attach.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: string
 *                 description: The ID of the customer to attach the payment method to.
 *     responses:
 *       200:
 *         description: Successfully attached the payment method to the customer.
 *       404:
 *         description: Payment method not found or could not be attached.
 *       500:
 *         description: Error attaching payment method.
 */
router.post('/payment_methods/:paymentMethodId/attach', attachPaymentMethod);

/**
 * @swagger
 * /api/stripe/payment_methods/{paymentMethodId}:
 *   get:
 *     summary: Retrieve a payment method by ID
 *     description: Retrieve details of a specific payment method by its ID.
 *     tags:
 *       - Stripe Payment Method
 *     parameters:
 *       - name: paymentMethodId
 *         in: path
 *         required: true
 *         description: The ID of the payment method to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the payment method.
 *       404:
 *         description: Payment method not found.
 *       500:
 *         description: Error retrieving payment method.
 */
router.get('/payment_methods/:paymentMethodId', getPaymentMethod);

/**
 * @swagger
 * /api/stripe/payment_methods/{paymentMethodId}/detach:
 *   post:
 *     summary: Detach a payment method from a customer
 *     description: Detach a specific payment method from the customer it is attached to.
 *     tags:
 *       - Stripe Payment Method
 *     parameters:
 *       - name: paymentMethodId
 *         in: path
 *         required: true
 *         description: The ID of the payment method to detach.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully detached the payment method.
 *       404:
 *         description: Payment method not found or could not be detached.
 *       500:
 *         description: Error detaching payment method.
 */
router.post('/payment_methods/:paymentMethodId/detach', detachPaymentMethod);

export default router;
