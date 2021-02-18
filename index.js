require('dotenv').config();

const fs = require('fs');
const csv = require('csv-parser');
const { logErrors, saveToMockDB } = require("./utils");

const { RateLimit } = require('async-sema');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Set the rate limit to 10 requests per second
// Note that Stripe allows up to 100 read/write operations per second in live mode
// and 25 operations per second for each in test mode. Take 
const MAX_REQUESTS_PER_SECOND = 10;
const limit = RateLimit(MAX_REQUESTS_PER_SECOND);

const processData = async (row) => {
  try {
    await limit();
    // Take customerId and priceId from the CSV file
    const customerId = row['Customer ID'];
    const priceId = row['Plan'];

    // Subscribe customer to the product
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Store the price.id, subscription.id and the customer.id in database
    saveToMockDB(customerId, priceId, subscription.id);
  } catch (error) {
    logErrors(row, error);
    // TODO: handle retry logic
  }
}

// Batch process data from the source CSV
fs.createReadStream('subscriptions.csv')
  .pipe(csv())
  .on('data', processData);

