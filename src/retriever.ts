import { DotenvConfig, puppeteer } from "./deps.ts";
import login from "./login.ts";
import retriever from "./browser/retriever.js";

export default async function (env: DotenvConfig) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await login(env, browser);
  const planning_raw_data = await page.evaluate(
    retriever,
    env.PROJECT_ID,
    JSON.parse(await Deno.readTextFile("./src/planning-resources-id.json")),
  );

  await browser.close();

  return planning_raw_data;
}
