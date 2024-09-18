import { Router } from 'express';
import {
  createPrice,
  getPrice,
  updatePrice,
  deactivatePrice,
  getAllPrices,
} from '../../controllers/stripe.price.crud.controller';

const router = Router();

router.post('/prices', createPrice);
router.get('/prices', getAllPrices);
router.get('/prices/:priceId', getPrice);
router.put('/prices/:priceId', updatePrice);
router.delete('/prices/:priceId', deactivatePrice);

export default router;
