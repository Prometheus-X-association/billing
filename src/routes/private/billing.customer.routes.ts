import { Router } from 'express';
import {
    getCustomerByCustomerId,
    getCustomerById,
    getCustomerByParticipantId,
    getCustomers
} from "../../controllers/billing.customer.controller";

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
 * /api/customers/participant/{participantId}:
 *   get:
 *     summary: Retrieve a billing customer by participantId
 *     description: Retrieve a billing customer by participantId.
 *     tags:
 *       - Customers
 *     parameters:
 *       - name: participantId
 *         in: path
 *         required: true
 *         description: The participantId of the billing customer.
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
router.get('/participant/:participantId', getCustomerByParticipantId);

/**
 * @swagger
 * /api/customers/customer/{customerId}:
 *   get:
 *     summary: Retrieve a billing customer by customerId
 *     description: Retrieve a billing customer by customerId.
 *     tags:
 *       - Customers
 *     parameters:
 *       - name: participantId
 *         in: path
 *         required: true
 *         description: The customerId of the billing customer.
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
router.get('/participant/:customerId', getCustomerByCustomerId);


export default router;
