/*
** Create subscriptions on Stripe from the supplied CSV
** Expect CSV file with headers [stripe_customer_id, coupon_duration_in_months, next_billing_date, plan_id, coupon_id]
*/
require('dotenv').config();

const fs = require('fs');
const csv = require('csv-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { RateLimit } = require('async-sema');
const { MAX_REQUESTS_PER_SECOND, MAX_COUPON_DURATION_IN_MONTH } = require('./utils/constants');
const limit = RateLimit(MAX_REQUESTS_PER_SECOND);
const { createSubscriptionPhases } = require('./utils/helpers');

const sourceCSV = process.argv.slice(2);

fs.createReadStream(`./mock-data/${sourceCSV}`)
  .pipe(csv())
  .on('data', async (row) => {
    try {
      await limit();
      const { stripe_customer_id, coupon_duration_in_months, next_billing_date, plan_id, coupon_id } = row;

      // Find Stripe plan using plan_id as the lookup key
      const plans = await stripe.prices.list({
        lookup_keys: [plan_id]
      });

      const plan = plans.data[0];

      // Create a subscription starting on the next billing date
      const schedule = await stripe.subscriptionSchedules.create({
        customer: stripe_customer_id,
        start_date: new Date(next_billing_date).getTime() / 1000,
        end_behavior: 'release', // subscription stays active while the Schedule itself ends
        phases: createSubscriptionPhases(coupon_id, plan.id, coupon_duration_in_months, MAX_COUPON_DURATION_IN_MONTH),
      });

      console.log(`Created Stripe subscription schedule ${schedule.id} success!`)

    } catch (error) {
      console.log(error);
    }
  });

