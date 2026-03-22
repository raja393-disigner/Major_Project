import express from 'express';
import { createOrder, verifyPayment, getPaymentReceipt } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/receipt/:taxId', getPaymentReceipt);

export default router;
