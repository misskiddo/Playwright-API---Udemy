import {expect, test as setup} from '@playwright/test'

setup('Delete article',async ({request}) => {
    const articleResponse = await request.delete(
        `https://api.realworld.io/api/articles/${process.env.SLUGID}`
      );
      expect(articleResponse.status()).toEqual(204);
})