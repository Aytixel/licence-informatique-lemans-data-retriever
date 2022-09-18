export default async function (project_id) {
  const start_date = new Date();
  const end_date = new Date(Date.now() + new Date(0).setMonth(4));

  const convert_date = (date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const retrieve = async (
    resource_id,
  ) => {
    return await fetch(
      `http://planning.univ-lemans.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resource_id}&projectId=${project_id}&calType=ical&firstDate=${
        convert_date(start_date)
      }&lastDate=${convert_date(end_date)}`,
    );
  };

  return await (await retrieve(1070)).text();
}
