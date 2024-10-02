import { Router } from 'express';
import {
    addPrice,
    createProduct,
    getProductById,
    listProductsByParticipantId
} from "../../controllers/billing.product.controller";

const router = Router();

/**
 * @swagger
 * /api/products/participant/{participantId}:
 *   get:
 *     summary: Retrieve all billing product by participantId
 *     description: Retrieve all billing product by participantId.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: participantId
 *         in: path
 *         required: true
 *         description: The participantId of the billing product.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the products.
 *       404:
 *         description: Products not found.
 *       500:
 *         description: Error retrieving products.
 */
router.get('/participant/:participantId', listProductsByParticipantId);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Retrieve a billing product by id
 *     description: Retrieve a billing product by id.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the billing product.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the product.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Error retrieving product.
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a billing product
 *     description: Create a billing product.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: The participant.
 *               stripeId:
 *                 type: string
 *                 description: The stripe id of the product
 *               defaultPriceId:
 *                 type: string
 *                 description: default price id set by the participant.
 *               offerId:
 *                 type: string
 *                 description: offer id from the system.
 *     responses:
 *       201:
 *         description: Successfully created product.
 *       500:
 *         description: Error creating the product.
 */
router.post('/', createProduct);

/**
 * @swagger
 * /api/products/{id}/price:
 *   post:
 *     summary: Add a price to the billing product
 *     description: Add a price to the billing product.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the billing product.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: The customer id.
 *               stripeId:
 *                 type: string
 *                 description: The stripe id of the price.
 *     responses:
 *       201:
 *         description: Successfully added price.
 *       500:
 *         description: Error adding the price.
 */
router.post('/:id/price', addPrice);

export default router;
