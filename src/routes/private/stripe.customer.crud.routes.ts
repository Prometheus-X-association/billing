import { Router } from 'express';
import {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getAllCustomers,
} from '../../controllers/stripe.customer.crud.controller';

const router = Router();

router.post('/customers', createCustomer);
router.get('/customers', getAllCustomers);
router.get('/customers/:customerId', getCustomer);
router.put('/customers/:customerId', updateCustomer);
router.delete('/customers/:customerId', deleteCustomer);

export default router;
