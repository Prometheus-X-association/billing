import { Router } from 'express';
import {
    getCustomerByStripeCustomerId,
    getCustomerById,
    getCustomerByParticipant,
    getCustomers
} from "../../controllers/billing.customer.controller";
import { base64Checker } from '../middlewares/base64Checker';

const router = Router();

/**
 * @swagger
 * /api/customers/:
 *   get:
 *     summary: Retrieve all billing customer
 *     description: Retrieve all billing customer.
 *     tags:
 *       - Customers
 *     responses:
 *       200:
 *         description: Successfully retrieved the customers.
 *       404:
 *         description: Customers not found.
 *       500:
 *         description: Error retrieving customers.
 */
router.get('/', getCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Retrieve a billing customer
 *     description: Retrieve a billing customer.
 *     tags:
 *       - Customers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the billing customer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the customers.
 *       404:
 *         description: Customers not found.
 *       500:
 *         description: Error retrieving customers.
 */
router.get('/:id', getCustomerById);

/**
 * @swagger
 * /api/customers/participant/{participant}:
 *   get:
 *     summary: Retrieve a billing customer by participant
 *     description: Retrieve a billing customer by participant.
 *     tags:
 *       - Customers
 *     parameters:
 *       - name: participant
 *         in: path
 *         required: true
 *         description: The participant of the billing customer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the customers.
 *       404:
 *         description: Customers not found.
 *       500:
 *         description: Error retrieving customers.
 */
router.get('/participant/:participant', base64Checker('participant'), getCustomerByParticipant);

/**
 * @swagger
 * /api/customers/customer/{stripeCustomerId}:
 *   get:
 *     summary: Retrieve a billing customer by stripeCustomerId
 *     description: Retrieve a billing customer by stripeCustomerId.
 *     tags:
 *       - Customers
 *     parameters:
 *       - name: stripeCustomerId
 *         in: path
 *         required: true
 *         description: The stripeCustomerId of the billing customer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the customers.
 *       404:
 *         description: Customers not found.
 *       500:
 *         description: Error retrieving customers.
 */
router.get('/stripe/:stripeCustomerId', getCustomerByStripeCustomerId);


export default router;
