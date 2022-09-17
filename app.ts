import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { MongoClient, ObjectId } from "./deps.ts";

interface L1 {
  _id: ObjectId;
  date: Date;
}

const env_config = config();
const mongo_client = new MongoClient({
  endpoint: env_config.MONGO_DB_ATLAS_ENDPOINT,
  dataSource: env_config.MONGO_DB_ATLAS_CLUSTER_NAME,
  auth: {
    apiKey: env_config.MONGO_DB_ATLAS_API_KEY,
  },
});
const planning_db = mongo_client.database("planning-v2");
const l1 = planning_db.collection<L1>("l1");
