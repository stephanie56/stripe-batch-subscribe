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
    // Take customerId and priceId from the CSV file
    const { first_name, last_name, email, legacy_subscription_id } = row;
    // Create customer
    const customer = await stripe.customers.create({
      name: `${first_name} ${last_name}`,
      email,
      payment_method: 'pm_card_visa',
      metadata: { legacy_subscription_id }
    });

    const customerId = customer.id;

    const header = [
      { id: 'name', title: 'name' },
      { id: 'customerId', title: 'customer_id' },
      { id: 'legacySubscriptionId', title: 'legacy_subscription_id' },
    ];
    const records = [{
      customerId,
      name: `${first_name} ${last_name}`,
      legacySubscriptionId: legacy_subscription_id
    }];

    saveToMockDB('mockCustomerDB.csv', { header, records });
  } catch (error) {
    console.log(error);
  }
}

// Batch process data from the source CSV
fs.createReadStream('./mock-data/mock-customers.csv')
  .pipe(csv())
  .on('data', processData);

