/*
** Create product plans (prices) on Stripe from the supplied CSV
** Expect CSV file headers [plan_id, plan_name, price, interval]
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
      const { plan_id, plan_name, price, interval } = row;
      const plan = await stripe.prices.create({
        unit_amount: parseFloat(price, 10) * 100,
        currency: 'usd',
        recurring: { interval },
        product_data: {
          name: plan_name,
          active: true,
        },
        lookup_key: plan_id
      });
      console.log(`Created Stripe plan ${plan.id} success!`)
    } catch (error) {
      console.log(error);
    }
  });

