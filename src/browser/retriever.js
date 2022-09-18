export default async function (project_id, planning_resources) {
  const start_date = new Date();
  const end_date = new Date(Date.now() + new Date(0).setMonth(4));

  const convert_date = (date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const retrieve = async (
    resource_id,
  ) => {
    return await (await fetch(
      `http://planning.univ-lemans.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resource_id}&projectId=${project_id}&calType=ical&firstDate=${
        convert_date(start_date)
      }&lastDate=${convert_date(end_date)}`,
    )).text();
  };

  for (const resource_type_key in planning_resources) {
    for (
      let resource_id_index = 0;
      resource_id_index < planning_resources[resource_type_key].length;
      resource_id_index++
    ) {
      planning_resources[resource_type_key][resource_id_index] = await retrieve(
        planning_resources[resource_type_key][resource_id_index],
      );
    }
  }

  return planning_resources;
}
