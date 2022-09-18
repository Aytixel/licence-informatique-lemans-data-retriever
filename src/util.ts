import { Page } from "./deps.ts";

async function wait_to_click(page: Page, selector: string) {
  await page.waitForSelector(selector, { visible: true });
  await page.waitForTimeout(1000);
  await page.click(selector);

  console.log(`click on ${selector}`);
}

export { wait_to_click };
