import { expect, test as setup } from "@playwright/test";

setup('Create new article', async({request})=>{

    const articleResponse = await request.post(
        "https://api.realworld.io/api/articles/",
        {
          data: {
            article: {
              title: "Likes test article",
              description: "description",
              body: "body",
              tagList: ["Automation"],
            },
          },
        }
      );
      expect(articleResponse.status()).toEqual(201);

      const response = await articleResponse.json()
      const slugId = response.article.slug
      process.env['SLUGID'] = slugId


})