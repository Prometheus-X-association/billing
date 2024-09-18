import { Router } from 'express';
import {
  createPrice,
  getPrice,
  updatePrice,
  deactivatePrice,
  getAllPrices,
} from '../../controllers/stripe.price.crud.controller';

const router = Router();

/**
 * @swagger
 * /prices:
 *   post:
 *     summary: Create a new price
 *     description: Create a new price for a product in Stripe.
 *     tags: [Prices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unit_amount:
 *                 type: integer
 *                 description: Price amount in cents.
 *                 example: 1000
 *               currency:
 *                 type: string
 *                 description: Currency for the price.
 *                 example: usd
 *               recurring:
 *                 type: object
 *                 properties:
 *                   interval:
 *                     type: string
 *                     description: Recurrence interval (e.g., month, year).
 *                     example: month
 *               product:
 *                 type: string
 *                 description: ID of the product associated with the price.
 *                 example: prod_test_1
 *     responses:
 *       201:
 *         description: Price created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Price'
 *       500:
 *         description: Failed to create the price.
 */
router.post('/prices', createPrice);

/**
 * @swagger
 * /prices:
 *   get:
 *     summary: Get all prices
 *     description: Retrieve a list of all prices.
 *     tags: [Prices]
 *     responses:
 *       200:
 *         description: A list of prices.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Price'
 *       404:
 *         description: No prices found.
 *       500:
 *         description: Failed to retrieve prices.
 */
router.get('/prices', getAllPrices);

/**
 * @swagger
 * /prices/{priceId}:
 *   get:
 *     summary: Get a specific price
 *     description: Retrieve a price by its ID.
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: priceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the price to retrieve.
 *     responses:
 *       200:
 *         description: Price retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Price'
 *       404:
 *         description: Price not found.
 *       500:
 *         description: Failed to retrieve the price.
 */
router.get('/prices/:priceId', getPrice);

/**
 * @swagger
 * /prices/{priceId}:
 *   put:
 *     summary: Update a price
 *     description: Update the details of an existing price.
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: priceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the price to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *                 description: Additional information about the price.
 *                 example: { key: 'value' }
 *     responses:
 *       200:
 *         description: Price updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Price'
 *       404:
 *         description: Price not found.
 *       500:
 *         description: Failed to update the price.
 */
router.put('/prices/:priceId', updatePrice);

/**
 * @swagger
 * /prices/{priceId}:
 *   delete:
 *     summary: Deactivate a price
 *     description: Deactivate a specific price by setting its active status to false.
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: priceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the price to deactivate.
 *     responses:
 *       200:
 *         description: Price deactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Price deactivated successfully.
 *                 price:
 *                   $ref: '#/components/schemas/Price'
 *       404:
 *         description: Price not found or could not be deactivated.
 *       500:
 *         description: Failed to deactivate the price.
 */
router.delete('/prices/:priceId', deactivatePrice);

export default router;
