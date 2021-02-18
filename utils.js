const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Write errors to the log file
const logErrors = (row, error) => {
  const customerId = row['Customer ID'];
  try {
    fs.appendFileSync('errorLog.txt', `${customerId}: ${error.code}\n`);
  } catch (error) {
    throw error;
  }
}

// Add data to the mockDB CSV file
const saveToMockDB = async (customerId, priceId, subscriptionId) => {
  try {
    const csvWriter = createCsvWriter({
      path: 'mockDB.csv',
      header: [
        { id: 'customerId', title: 'Customer Name' },
        { id: 'priceId', title: 'Price ID' },
        { id: 'subscriptionId', title: 'Subscription ID' },
      ],
      append: true,
    });

    const records = [{ customerId, priceId, subscriptionId }];

    await csvWriter.writeRecords(records);
  } catch (error) {
    throw error;
  }
}


module.exports = { logErrors, saveToMockDB }
