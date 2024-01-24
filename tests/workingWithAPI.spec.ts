import { test, expect, request } from "@playwright/test";
import tags from "../test-data/tags.json";


test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto("https://angular.realworld.how/");
  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name: "Email"}).fill('tonicabrera87@gmail.com')
  await page.getByRole('textbox', {name: "Password"}).fill('Toni123')
  await page.getByRole('button').click()

 
});

test("Intercept response", async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is MOCK test title"
    responseBody.articles[0].description = "This is MOCK test description"
  
    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  } )

  await page.getByText('Global Feed').click()
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  await expect(page.locator('app-article-list h1').first()).toContainText("This is MOCK test title")
  await expect(page.locator('app-article-list p').first()).toContainText("This is MOCK test description")
});


test('Delete article', async ({page, request})=>{
  const response = await request.post('https://api.realworld.io/api/users/login', {
    data: {
      "user":{"email":"tonicabrera87@gmail.com","password":"Toni123"}
    }
  })

  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://api.realworld.io/api/articles/', {
    data: {"article":{"title":"This is a test article","description":"description","body":"body","tagList":["Automation"]}},
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('This is a test article').click()
  await page.getByRole('button', {name:"Delete article"}).first().click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).not.toContainText("This is a test article")


})