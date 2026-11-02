import { test, expect } from "@playwright/test";

const routes = [
  ["login", "/"],
  ["dashboard", "/demo/overview"],
  ["investigation", "/demo/investigations/4821"],
] as const;
const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

for (const viewport of viewports) {
  for (const [name, route] of routes) {
    test(`${name} at ${viewport.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page).toHaveScreenshot(`${name}-${viewport.name}.png`, {
        fullPage: true,
      });
      await page.screenshot({
        path: testInfo.outputPath(`${name}-${viewport.name}-after.png`),
        fullPage: true,
        animations: "disabled",
      });
    });
  }
}
