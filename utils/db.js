import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

class DBClient {
  constructor() {
    this.db = null;
    this.dbName = "todolist";
    this.client = new MongoClient(process.env.MONGO_URL); /*{connectTimeoutMS: 3000, socketTimeoutMS: 10000, serverSelectionTimeoutMS: 5000}*/
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log("MongoDB connected");
    } catch (error) {
      console.log("MongoDB connection error:", error);
    }
  }

  getDb() {
    if (!this.db) throw new Error("MongoDB not connected. call connect() first.");
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log("MongoDB disconnected");
      return;
    }
    console.log("MongoDB already disconnected");
  }
}

const dbClient = new DBClient();
export default dbClient;
