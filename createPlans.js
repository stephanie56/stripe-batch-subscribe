require('dotenv').config();

const fs = require('fs');
const csv = require('csv-parser');
const { saveToMockDB } = require("./utils");

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
    const { legacy_subscription_id, price, recurring, product_name } = row;
    const plan = await stripe.prices.create({
      unit_amount: parseInt(price, 10) * 100,
      currency: 'usd',
      recurring: { interval: recurring },
      product_data: {
        name: product_name,
        active: true,
      },
      metadata: { legacy_subscription_id }
    });

    const priceId = plan.id;

    const header = [
      { id: 'priceId', title: 'Plan ID' },
      { id: 'legacySubscriptionId', title: 'Legacy Subscription ID' },
    ];
    const records = [{
      priceId,
      legacySubscriptionId: legacy_subscription_id
    }];

    saveToMockDB('mockPlanDB.csv', { header, records });
  } catch (error) {
    console.log(error);
  }
}

// Batch process data from the source CSV
fs.createReadStream('./mock-data/mock-plans.csv')
  .pipe(csv())
  .on('data', processData);

