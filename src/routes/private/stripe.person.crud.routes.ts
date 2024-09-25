import { Router } from 'express';
import {
  createPerson,
  updatePerson,
  getPerson,
  deletePerson,
} from '../../controllers/stripe.person.crud.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/accounts/{accountId}/persons:
 *   post:
 *     summary: Create a new person in an account
 *     description: Create a new person under a specific Stripe account using the provided data.
 *     tags:
 *       - Stripe Person
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the account in which to create the person.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               dob:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: integer
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *               email:
 *                 type: string
 *               relationship:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   owner:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Successfully created the person.
 *       500:
 *         description: Failed to create person.
 */
router.post('/accounts/:accountId/persons', createPerson);

/**
 * @swagger
 * /api/stripe/accounts/{accountId}/persons/{personId}:
 *   post:
 *     summary: Update a person in an account
 *     description: Update an existing person's details in a Stripe account.
 *     tags:
 *       - Stripe Person
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the account that contains the person.
 *         schema:
 *           type: string
 *       - name: personId
 *         in: path
 *         required: true
 *         description: The ID of the person to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               dob:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: integer
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated the person.
 *       404:
 *         description: Person not found.
 *       500:
 *         description: Error updating person.
 */
router.post('/accounts/:accountId/persons/:personId', updatePerson);

/**
 * @swagger
 * /api/stripe/accounts/{accountId}/persons/{personId}:
 *   get:
 *     summary: Retrieve a person by ID
 *     description: Get the details of a specific person by their ID in the Stripe account.
 *     tags:
 *       - Stripe Person
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the account that contains the person.
 *         schema:
 *           type: string
 *       - name: personId
 *         in: path
 *         required: true
 *         description: The ID of the person to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the person.
 *       404:
 *         description: Person not found.
 *       500:
 *         description: Error retrieving person.
 */
router.get('/accounts/:accountId/persons/:personId', getPerson);

/**
 * @swagger
 * /api/stripe/accounts/{accountId}/persons/{personId}:
 *   delete:
 *     summary: Delete a person by ID
 *     description: Delete a specific person from a Stripe account by their ID.
 *     tags:
 *       - Stripe Person
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         description: The ID of the account that contains the person.
 *         schema:
 *           type: string
 *       - name: personId
 *         in: path
 *         required: true
 *         description: The ID of the person to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the person.
 *       404:
 *         description: Person not found or could not be deleted.
 *       500:
 *         description: Error deleting person.
 */
router.delete('/accounts/:accountId/persons/:personId', deletePerson);

export default router;
