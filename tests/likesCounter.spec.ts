import {test, expect, request} from '@playwright/test'

test('Like counter', async ({page})=>{

    await page.goto('')
    await page.getByText('Global Feed').click()
    const firstLikeButton = page.locator('app-article-preview').first().locator('button')
    await expect(firstLikeButton).toContainText('0')
    await firstLikeButton.click()
})