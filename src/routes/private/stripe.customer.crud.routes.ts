import { Router } from 'express';
import {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getAllCustomers,
} from '../../controllers/stripe.customer.crud.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/customers:
 *   post:
 *     summary: Create a new customer for the connected account in stripe
 *     description: This endpoint allows you to create a new customer in Stripe with the given details.
 *     tags:
 *       - Stripe Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the customer.
 *               name:
 *                 type: string
 *                 description: The name of the customer.
 *               connectedAccountId:
 *                 type: string
 *                 description: The connected account id.
 *     responses:
 *       201:
 *         description: Successfully created a new customer.
 *       500:
 *         description: Failed to create customer.
 */
router.post('/customers', createCustomer);

/**
 * @swagger
 * /api/stripe/customers:
 *   get:
 *     summary: Get a list of all Stripe customers
 *     description: Retrieve all customers currently stored in the Stripe account.
 *     tags:
 *       - Stripe Customer
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Customer ID.
 *                   email:
 *                     type: string
 *                     description: Customer email.
 *       404:
 *         description: No customers found.
 *       500:
 *         description: Error retrieving customers.
 */
router.get('/customers', getAllCustomers);

/**
 * @swagger
 * /api/stripe/customers/{customerId}:
 *   get:
 *     summary: Retrieve a customer by ID
 *     description: Retrieve a specific customer from Stripe using the customer ID.
 *     tags:
 *       - Stripe Customer
 *     parameters:
 *       - name: customerId
 *         in: path
 *         required: true
 *         description: The ID of the customer to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the customer.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Error retrieving customer.
 */
router.get('/customers/:customerId', getCustomer);

/**
 * @swagger
 * /api/stripe/customers/{customerId}:
 *   put:
 *     summary: Update an existing customer by ID
 *     description: Update the details of a specific customer using the customer ID.
 *     tags:
 *       - Stripe Customer
 *     parameters:
 *       - name: customerId
 *         in: path
 *         required: true
 *         description: The ID of the customer to update.
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
 *                 description: New email for the customer.
 *               name:
 *                 type: string
 *                 description: New name for the customer.
 *     responses:
 *       200:
 *         description: Successfully updated the customer.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Error updating customer.
 */
router.put('/customers/:customerId', updateCustomer);

/**
 * @swagger
 * /api/stripe/customers/{customerId}:
 *   delete:
 *     summary: Delete a customer by ID
 *     description: Delete a specific customer from Stripe using the customer ID.
 *     tags:
 *       - Stripe Customer
 *     parameters:
 *       - name: customerId
 *         in: path
 *         required: true
 *         description: The ID of the customer to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully.
 *       404:
 *         description: Customer not found or could not be deleted.
 *       500:
 *         description: Error deleting customer.
 */
router.delete('/customers/:customerId', deleteCustomer);

export default router;
