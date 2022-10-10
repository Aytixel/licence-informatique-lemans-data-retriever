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

interface Lesson {
  title: string;
  start_date: Date;
  end_date: Date;
  description: string[];
  rooms: string[];
}

interface Day {
  date: Date;
  group: number;
  lessons: Lesson[];
}

const env = await config();

const update = async () => {
  try {
    const mongo_client = new MongoClient();
    const planning_db = await mongo_client.connect({
      db: "planning-v2",
      tls: true,
      servers: env.MONGO_DB_HOSTS.split(",").map((host) => ({
        host: host,
        port: parseInt(env.MONGO_DB_PORT),
      })),
      credential: {
        username: env.MONGO_DB_USERNAME,
        password: env.MONGO_DB_PASSWORD,
        db: "planning-v2",
        mechanism: "SCRAM-SHA-1",
      },
    });

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
              lessons: [],
            }) - 1
          ];

          day.lessons.push(
            {
              title: event.summary,
              start_date: event.startDate.toJSDate(),
              end_date: event.endDate.toJSDate(),
              description: event.description.trim().split("\n").slice(0, -1)
                .map((x) => x.trim()),
              rooms: event.location.split(",").map((x) => x.trim()),
            },
          );

          planning[day_index] = day;
        }

        const collection = planning_db.collection(resource_type_key);
        const update_promises = [];

        for (const day of planning) {
          day.lessons.sort((a, b) =>
            a.start_date.getTime() - b.start_date.getTime()
          );

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
      "stop retrieving data at : " + new Date().toLocaleString() + "\n\n\n",
    );

    mongo_client.close();

    setTimeout(update, 1000 * 60 * 60 * 2);
  } catch (error) {
    console.error(error);

    setTimeout(update, 1000 * 60 * 30);
  }
};

update();
