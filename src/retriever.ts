export default async function (env: Record<string, string>) {
  const planning_raw_data = JSON.parse(
    await Deno.readTextFile("./src/planning-resources-id.json"),
  );

  const convert_date = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  const start_date = convert_date(new Date());
  const end_date = convert_date(new Date(Date.now() + new Date(0).setMonth(4)));

  const retrieve = async (resource_id: number) =>
    (await fetch(
      `http://planning.univ-lemans.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resource_id}&projectId=${env.PROJECT_ID}&calType=ical&firstDate=${start_date}&lastDate=${end_date}`,
    )).text();

  for (const resource_type_key in planning_raw_data) {
    for (
      let resource_id_index = 0;
      resource_id_index < planning_raw_data[resource_type_key].length;
      resource_id_index++
    ) {
      planning_raw_data[resource_type_key][resource_id_index] = await retrieve(
        planning_raw_data[resource_type_key][resource_id_index],
      );
    }
  }

  return planning_raw_data;
}
