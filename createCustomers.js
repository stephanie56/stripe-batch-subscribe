/*
** Stripe imports customers and their payment methods as part of the migration process
** This helper script is used to create mock customers on Stripe for testing purpose
** Expect CSV file headers ['name', 'email']
*/
require('dotenv').config();

const fs = require('fs');
const csv = require('csv-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { RateLimit } = require('async-sema');
const { MAX_REQUESTS_PER_SECOND } = require('./utils/constants');
const limit = RateLimit(MAX_REQUESTS_PER_SECOND);

const sourceCSV = process.argv.slice(2);

fs.createReadStream(`./mock-data/${sourceCSV}`)
  .pipe(csv())
  .on('data', async (row) => {
    try {
      await limit();
      const { name, email } = row;
      const customer = await stripe.customers.create({
        name,
        email,
        payment_method: 'pm_card_visa',
      });
      console.log(`Created customer ${customer.id} success!`)
    } catch (error) {
      console.log(error);
    }
  });

