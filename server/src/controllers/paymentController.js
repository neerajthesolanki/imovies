import { processPayment } from '../services/paymentService.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

export const initiatePayment = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', bookingReference } = req.body;
    if (!amount) return sendError(res, 400, 'Payment amount is required.');

    const paymentSession = {
      orderId: 'ORD_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      amount,
      currency,
      paymentMode: process.env.PAYMENT_MODE || 'simulated',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated'
    };

    return sendResponse(res, 200, true, 'Payment initialized.', paymentSession);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, bookingReference, simulateFailure = false } = req.body;

    const result = await processPayment({
      amount,
      paymentMethod,
      bookingReference,
      simulateFailure
    });

    if (!result.success) {
      return sendError(res, 402, result.message);
    }

    return sendResponse(res, 200, true, 'Payment verified successfully.', result);
  } catch (error) {
    next(error);
  }
};
