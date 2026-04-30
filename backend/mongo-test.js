const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:123@cluster0.mitomzn.mongodb.net/Campus_Management";
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db("Campus_Management");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("Connection error:", err.message);
  } finally {
    await client.close();
  }
}
run();
