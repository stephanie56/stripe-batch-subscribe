/*
** Create coupons on Stripe from the supplied CSV
** Expect CSV file with headers ['coupon_id', 'coupon_name', 'percent_off', 'amount_off']
*/
require('dotenv').config();

const fs = require('fs');
const csv = require('csv-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { RateLimit } = require('async-sema');
const { MAX_REQUESTS_PER_SECOND } = require('./constants');
const limit = RateLimit(MAX_REQUESTS_PER_SECOND);

const sourceCSV = process.argv.slice(2);

fs.createReadStream(`./mock-data/${sourceCSV}`)
  .pipe(csv())
  .on('data', async (row) => {
    try {
      await limit();
      const { coupon_id, coupon_name, percent_off, amount_off } = row;
      let coupon;

      if (!percent_off) {
        coupon = await stripe.coupons.create({
          id: coupon_id,
          name: coupon_name,
          amount_off,
          currency: 'usd',
          duration: 'forever',
        });
      } else {
        coupon = await stripe.coupons.create({
          id: coupon_id,
          name: coupon_name,
          percent_off,
          duration: 'forever',
        });
      }
      console.log(`Created Stripe coupon ${coupon.id} success!`)
    } catch (error) {
      console.log(error);
    }
  });

