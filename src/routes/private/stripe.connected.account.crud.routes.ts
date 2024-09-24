import { Router } from 'express';
import {
  createConnectedAccount,
  createLoginLink,
  deleteConnectedAccount,
  getConnectedAccount,
  updateConnectedAccount,
} from '../../controllers/stripe.connected.account.crud.controller';

const router = Router();

router.post('/accounts', createConnectedAccount);
router.post('/accounts/:accountId', updateConnectedAccount);
router.get('/accounts/:accountId', getConnectedAccount);
router.delete('/accounts/:accountId', deleteConnectedAccount);
router.post('/accounts/:accountId/login_links', createLoginLink);

export default router;
