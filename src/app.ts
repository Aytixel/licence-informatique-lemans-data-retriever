import { config, ICAL } from "./deps.ts";
import retrieve from "./retriever.ts";

/*
// Simple MongoDB Atlas connection example
import { config, MongoClient, ObjectId } from "./deps.ts";

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
*/

const env = config();
const planning_raw_data = await retrieve(env);

for (const resource_type_key in planning_raw_data) {
  for (
    let resource_id_index = 0;
    resource_id_index < planning_raw_data[resource_type_key].length;
    resource_id_index++
  ) {
    console.log(
      new ICAL.Component(
        ICAL.parse(planning_raw_data[resource_type_key][resource_id_index]),
      ).getAllSubcomponents("vevent"),
    );
  }
}
