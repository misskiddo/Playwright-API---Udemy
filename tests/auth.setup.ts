import { test as setup } from "@playwright/test";
import user from "../.auth/user.json";
import fs from "fs";

const authFile = ".auth/user.json";

/*
setup("authentication using the UI", async ({ page }) => {
  await page.goto("https://angular.realworld.how/");
  await page.getByText("Sign in").click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("tonicabrera87@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("Toni123");
  await page.getByRole("button").click();
  await page.waitForResponse("https://api.realworld.io/api/tags");

  await page.context().storageState({ path: authFile });
}); */

setup("authentication using the API", async ({ request }) => {
  const response = await request.post(
    "https://api.realworld.io/api/users/login",
    {
      data: {
        user: { email: "tonicabrera87@gmail.com", password: "Toni123" },
      },
    }
  );

  const responseBody = await response.json();
  const accessToken = responseBody.user.token;
  user.origins[0].localStorage[0].value = accessToken;
  fs.writeFileSync(authFile, JSON.stringify(user));
  process.env['ACCESS_TOKEN'] = accessToken
});
