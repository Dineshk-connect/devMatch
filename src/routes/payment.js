const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payments = require("../models/payments");
const User = require("../models/user"); // ✅ You forgot to import this
const { membershipAmount } = require("../utils/constants");

// ✅ Create Razorpay Order
paymentRouter.post("/payment/create/", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, email } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        email,
        membershipType,
      },
    });

    console.log("Razorpay Order:", order);

    const payment = new Payments({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Send order details to frontend
    res.json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Payment creation error:", err);
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Handle successful payment (update DB + user)
paymentRouter.post("/payment/success", userAuth, async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    // Update payment record
    const payment = await Payments.findOneAndUpdate(
      { orderId },
      { status: "paid", paymentId },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    // Update user to premium
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { isPremium: true },
      { new: true }
    );

    res.json({
      msg: "Payment successful, premium activated!",
      payment,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Payment success error:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = paymentRouter;
