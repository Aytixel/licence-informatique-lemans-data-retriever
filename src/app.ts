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
const planning_raw_data = await retrieve(env);
const plannings: any = {
  l1: [],
  l2: [],
  l3: [],
  m1: [],
  m2: [],
  salle_ic2: [],
};

/*
first more recent   : +
second more recent  : -
first = second      : 0
*/
const compare_date = (first_date: Date, second_date: Date) =>
  first_date.getTime() - second_date.getTime();

// keep only the date part
const keep_only_date = (date: Date) =>
  new Date(date.getTime() - (date.getTime() % (1000 * 60 * 60 * 24)));

for (const resource_type_key in planning_raw_data) {
  for (
    let resource_id_index = 0;
    resource_id_index < planning_raw_data[resource_type_key].length;
    resource_id_index++
  ) {
    const planning: Day[] = [];
    const events: Event[] = new ICAL.Component(
      ICAL.parse(planning_raw_data[resource_type_key][resource_id_index]),
    ).getAllSubcomponents("vevent").map((x: unknown) => new ICAL.Event(x));

    events.forEach((event: Event) => {
      const date = keep_only_date(event.startDate.toJSDate());
      let day_index = planning.findIndex((x) => !compare_date(x.date, date));
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
          description: event.description.trim().split("\n").slice(0, -1).join(
            "\n",
          ),
          room: event.location,
        },
      );

      planning[day_index] = day;
    });

    plannings[resource_type_key].push(planning);
  }
}

console.log(plannings);
