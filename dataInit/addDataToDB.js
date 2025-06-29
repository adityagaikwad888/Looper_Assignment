const { MongoClient } = require("mongodb");
const fs = require("fs");

// Simple script to add transaction data to MongoDB
async function addTransactionData() {
  const mongoUri = "";
  const dbName = "transactionsData";
  const collectionName = "transactions";

  let client;

  try {
    console.log("🔗 Connecting to MongoDB...");
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Read transactions from JSON file
    console.log("📖 Reading transactions.json...");
    const transactionsData = JSON.parse(
      fs.readFileSync("../transactions.json", "utf8")
    );
    console.log(`📊 Found ${transactionsData.length} transactions`);

    // Clear existing data (optional)
    await collection.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Insert all transactions
    console.log("💾 Inserting transactions...");
    const result = await collection.insertMany(transactionsData);
    console.log(
      `✅ Successfully inserted ${result.insertedCount} transactions`
    );

    // Quick validation
    const count = await collection.countDocuments();
    console.log(`📋 Total documents in database: ${count}`);

    console.log("🎉 Done! Data added to MongoDB successfully");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Disconnected from MongoDB");
    }
  }
}

// Run the function
addTransactionData();
