const stripe = require('stripe')('sk_test_51O5YoBGsUetCRBLOkaFwcs9QAcfSRHnua2TIKBds4zbEq8BRhKNYe0uqrOg3aXJ3Yl3gtjNpJFvpFh4WFi9kD9mM00jZ71d2Ni')
const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById, findUserByUsername } = require('./users.services');
const { db } = require('../../utils/db');

const router = express.Router();


app.post('/create-checkout-session', isAuthenticated, async (req, res) => {
    const {userId} = req.payload;
    const {amount, card, channel} = req.body;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Donation',
            channel: channel
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:4242/success',
    cancel_url: 'http://localhost:4242/cancel',
  });

  res.redirect(303, session.url);
});




module.exports = router;
