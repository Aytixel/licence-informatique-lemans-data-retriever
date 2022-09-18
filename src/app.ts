import { config, ICAL, puppeteer } from "./deps.ts";
import login from "./login.ts";
import retriever from "./browser/retriever.js";

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
const browser = await puppeteer.launch({
  headless: false,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await login(env, browser);

console.log(
  new ICAL.Event(new ICAL.Component(ICAL.parse(
    await page.evaluate(
      retriever,
      env.PROJECT_ID,
    ),
  )).getFirstSubcomponent("vevent")),
);

await browser.close();
