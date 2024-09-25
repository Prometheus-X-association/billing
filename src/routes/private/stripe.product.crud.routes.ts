import { Router } from 'express';
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from '../../controllers/stripe.product.crud.controller';

const router = Router();

/**
 * @swagger
 * /api/stripe/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product in Stripe with the given data.
 *     tags:
 *       - Stripe Product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *               metadata:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       500:
 *         description: Failed to create product.
 */
router.post('/products', createProduct);

/**
 * @swagger
 * /api/stripe/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products available in Stripe.
 *     tags:
 *       - Stripe Product
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   active:
 *                     type: boolean
 *       404:
 *         description: No products found.
 *       500:
 *         description: Error retrieving products.
 */
router.get('/products', getAllProducts);

/**
 * @swagger
 * /api/stripe/products/{productId}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve details of a specific product by its ID.
 *     tags:
 *       - Stripe Product
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: The ID of the product to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 active:
 *                   type: boolean
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Error retrieving product.
 */
router.get('/products/:productId', getProduct);

/**
 * @swagger
 * /api/stripe/products/{productId}:
 *   put:
 *     summary: Update a product by ID
 *     description: Update details of a specific product by its ID in Stripe.
 *     tags:
 *       - Stripe Product
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: The ID of the product to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Error updating product.
 */
router.put('/products/:productId', updateProduct);

/**
 * @swagger
 * /api/stripe/products/{productId}:
 *   delete:
 *     summary: Delete a product by ID
 *     description: Delete a specific product from Stripe by its ID.
 *     tags:
 *       - Stripe Product
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: The ID of the product to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       404:
 *         description: Product not found or could not be deleted.
 *       500:
 *         description: Error deleting product.
 */
router.delete('/products/:productId', deleteProduct);

export default router;
