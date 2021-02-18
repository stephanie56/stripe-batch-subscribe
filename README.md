# Batch Processing Stripe Subscription

## Overview

This simple script does the following:

1. Parse Stripe customer Id and plan Id from the `subscriptions.csv` file (a mapping of customer ID to plan ID)
2. Automate connecting a customer to a plan
3. Errors will be logged in the `errorLog.txt` file
4. Success subscription will write customer ID, plan ID and subscription ID to the `mockDB.csv` file

## Usage

1. Add Stripe secret key to the `.env` file
2. Create customer accounts and subscription plans in the Stripe dashboard
3. Update the `subscriptions.csv` file with CSV mapping of user ID to plan ID
4. Run the script

```script
npm run start
```
