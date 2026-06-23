const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');

const CF_APP_ID = process.env.CASHFREE_APP_ID || "TEST_APP_ID";
const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "TEST_SECRET_KEY";
const isProd = process.env.CASHFREE_ENV === 'PRODUCTION' || process.env.CASHFREE_APP_ID?.startsWith('live_');
const CF_BASE_URL = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

exports.initializeScanPay = async (req, res, next) => {
  try {
    const { planId, email } = req.body;

    // Plan pricing map
    const PLAN_PRICES = {
      Pack: 10,        // ₹10 one-time pack — 50 credits, no expiry
      ProMonthly: 199, // ₹199/month — Unlimited for 30 days
    };

    const amount = PLAN_PRICES[planId];
    if (!amount) return res.status(400).json({ error: 'Invalid planId. Valid options: Pack, ProMonthly' });

    const orderId = 'ORD_' + Date.now() + Math.floor(Math.random() * 1000);

    let returnUrl = (process.env.FRONTEND_URL || "http://localhost:5173") + "/payment-success?order_id={order_id}";
    if (isProd && returnUrl.startsWith("http://")) {
      returnUrl = returnUrl.replace("http://", "https://");
    }

    const payload = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: "CUST_" + Date.now(),
        customer_phone: "8424036841",
        customer_email: email || "anonymous-client@veostudio.com"
      },
      order_meta: {
        return_url: returnUrl
      }
    };

    const response = await axios.post(`${CF_BASE_URL}/orders`, payload, {
      headers: {
        'x-client-id': CF_APP_ID,
        'x-client-secret': CF_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
      amount: amount
    });

  } catch (error) {
    console.error("❌ Cashfree Order Creation Error:", error?.response?.data || error.message);
    next(error);
  }
};

exports.verifyPaymentStatus = async (req, res, next) => {
  try {
    const { orderId, email, planId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Missing parameter: orderId' });

    const response = await axios.get(`${CF_BASE_URL}/orders/${orderId}/payments`, {
      headers: {
        'x-client-id': CF_APP_ID,
        'x-client-secret': CF_SECRET_KEY,
        'x-api-version': '2023-08-01'
      }
    });

    // Check if any payment is SUCCESS
    const payments = response.data;
    const isSuccess = payments.some(p => p.payment_status === "SUCCESS");

    if (!isSuccess) {
      return res.status(200).json({
        success: true,
        status: 'PENDING',
        isUnlimited: false,
        message: 'Payment not successful yet.'
      });
    }

    // Update user in DB if email is provided
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        if (planId === 'ProMonthly') {
          // ₹199/month — Unlimited usage, expires in 30 days
          user.plan = 'ProMonthly';
          user.isUnlimited = true;
          user.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          // Do NOT modify credits — unlimited plan bypasses credit checks
        } else if (planId === 'Pack') {
          // ₹10 one-time — Exactly 50 credits, no expiry
          user.plan = 'Pack';
          user.credits = (user.credits || 0) + 50;
          user.isUnlimited = false; // Credits must deduct normally
          user.planExpiry = null;   // No expiry for credit pack
        }
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      status: 'SUCCESS',
      isUnlimited: planId === 'ProMonthly',
      message: 'Payment confirmed. Access granted.'
    });

  } catch (error) {
    console.error("❌ Cashfree Verify Error:", error?.response?.data || error.message);
    next(error);
  }
};
