import { Router } from 'express';
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from '../../controllers/stripe.product.crud.controller';

const router = Router();

router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:productId', getProduct);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

export default router;
