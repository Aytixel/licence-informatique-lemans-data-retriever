import { config, ICAL, MongoClient } from "./deps.ts";
import retrieve from "./retriever.ts";
import { compare_date, keep_only_date } from "./utils.ts";

interface ToDate {
  toJSDate: () => Date;
}

interface Event {
  startDate: ToDate;
  endDate: ToDate;
  location: string;
  summary: string;
  description: string;
}

interface Course {
  title: string;
  start_date: Date;
  end_date: Date;
  description: string;
  room: string;
}

interface Day {
  date: Date;
  group: number;
  courses: Course[];
}

const env = config();
const update = async () => {
  const mongo_client = new MongoClient({
    endpoint: env.MONGO_DB_ATLAS_ENDPOINT,
    dataSource: env.MONGO_DB_ATLAS_CLUSTER_NAME,
    auth: {
      apiKey: env.MONGO_DB_ATLAS_API_KEY,
    },
  });
  const planning_db = mongo_client.database("planning-v2");

  try {
    console.log(
      "start retrieving data at : " + new Date().toLocaleString() + "\n",
    );
    console.log("start retrieving data with puppeteer");

    const planning_raw_data = await retrieve(env);

    console.log("stop retrieving data with puppeteer\n");

    for (const resource_type_key in planning_raw_data) {
      console.log("start parsing and updating " + resource_type_key);

      for (
        let resource_id_index = 0;
        resource_id_index < planning_raw_data[resource_type_key].length;
        resource_id_index++
      ) {
        console.log("group : " + resource_id_index);

        const planning: Day[] = [];
        const events: Event[] = new ICAL.Component(
          ICAL.parse(planning_raw_data[resource_type_key][resource_id_index]),
        ).getAllSubcomponents("vevent").map((x: unknown) => new ICAL.Event(x));

        for (const event of events) {
          const date = keep_only_date(event.startDate.toJSDate());
          let day_index = planning.findIndex((x) =>
            !compare_date(x.date, date)
          );
          const day = (day_index > -1) ? planning[day_index] : planning[
            day_index = planning.push({
              date: date,
              group: resource_id_index,
              courses: [],
            }) - 1
          ];

          day.courses.push(
            {
              title: event.summary,
              start_date: event.startDate.toJSDate(),
              end_date: event.endDate.toJSDate(),
              description: event.description.trim().split("\n").slice(0, -1)
                .join(
                  "\n",
                ),
              room: event.location,
            },
          );

          planning[day_index] = day;
        }

        const collection = planning_db.collection(resource_type_key);
        const update_promises = [];

        for (const day of planning) {
          update_promises.push(
            collection.updateOne({ date: day.date, group: day.group }, {
              $set: day,
            }, { upsert: true }),
          );
        }

        await Promise.all(update_promises);
      }

      console.log("stop parsing and updating " + resource_type_key + "\n");
    }

    console.log(
      "stop retrieving dataat : " + new Date().toLocaleString() + "\n\n\n",
    );
  } catch (error) {
    console.error(error);
  }
};

setInterval(update, 1000 * 60 * 60 * 2);
