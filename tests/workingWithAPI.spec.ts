import { test, expect, request } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });
  await page.goto("/");
});

test("Intercept response", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is MOCK test title";
    responseBody.articles[0].description = "This is MOCK test description";

    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.getByText("Global Feed").click();
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "This is MOCK test title"
  );
  await expect(page.locator("app-article-list p").first()).toContainText(
    "This is MOCK test description"
  );
});

test("Create article with API and delete it with UI", async ({
  page,
  request,
}) => {
  const articleResponse = await request.post(
    "https://api.realworld.io/api/articles/",
    {
      data: {
        article: {
          title: "This is a test article",
          description: "description",
          body: "body",
          tagList: ["Automation"],
        },
      },
    }
  );
  expect(articleResponse.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("This is a test article").click();
  await page.getByRole("button", { name: "Delete article" }).first().click();
  await page.getByText("Global Feed").click();
  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "This is MOCK test title"
  );
});

test("Create article with UI and delete article with API", async ({
  page,
  request,
}) => {
  await page.getByText("New Article").click();
  await page.getByPlaceholder("Article Title").fill("Bailando bailando");
  await page
    .getByPlaceholder("What's this article about")
    .fill("Nueva cancion");
  await page.getByPlaceholder("Write your article").fill("Just a description");
  await page.getByRole("button").click();

  const createArticleResponse = await page.waitForResponse(
    "https://api.realworld.io/api/articles/"
  );
  const articleBody = await createArticleResponse.json();
  const slugId = articleBody.article.slug;

  await expect(page.locator(".article-page h1")).toContainText(
    "Bailando bailando"
  );

  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "Bailando bailando"
  );

  const articleResponse = await request.delete(
    `https://api.realworld.io/api/articles/${slugId}`
  );
  expect(articleResponse.status()).toEqual(204);
});
