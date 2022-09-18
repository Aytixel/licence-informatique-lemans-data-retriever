import { DotenvConfig } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Browser, Page } from "./deps.ts";

export default function (
  env: DotenvConfig,
  browser: Browser,
): Promise<Page> {
  const login = async (resolve: (value: Page) => void) => {
    const page = (await browser.pages())[0];

    await page.goto("http://planning.univ-lemans.fr/direct/myplanning.jsp");
    await page.type("#username", env.STUDENT_USERNAME);
    await page.type("#password", env.STUDENT_PASSWORD);
    await page.click("#fm1 > div:nth-child(3) > div > div > button");

    page.on("load", () => {
      resolve(page);
    });
  };

  return new Promise((resolve) => login(resolve));
}
