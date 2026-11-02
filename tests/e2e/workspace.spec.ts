import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const primaryPages = [
  { path: "/", name: "welcome", heading: "Understand your" },
  { path: "/demo/overview", name: "overview", heading: "Business Overview" },
  {
    path: "/demo/investigations/4821",
    name: "investigation",
    heading: "Investigation Workspace",
  },
];

for (const route of primaryPages) {
  test(`${route.name}: accessible, responsive, and no runtime errors`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      route.heading,
    );
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      accessibility.violations.map((item) => ({
        id: item.id,
        description: item.description,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          failure: node.failureSummary,
        })),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`${route.name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: "disabled",
    });
    expect(errors).toEqual([]);
  });
}

test("demo entry works while account controls cannot submit credentials", async ({
  page,
}) => {
  const mutations: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()))
      mutations.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByLabel("Email", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Password", { exact: true })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Sign in to BizBrain AI" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByLabel("Full name")).toBeDisabled();
  await page.getByRole("link", { name: "Explore Demo Workspace" }).click();
  await expect(page).toHaveURL(/\/demo\/overview$/);
  expect(mutations).toEqual([]);
});

test("supported order question opens the complete investigation and its sources", async ({
  page,
}) => {
  await page.goto("/demo/overview");
  await page
    .getByLabel("Ask a business question")
    .fill("Why is order #4821 delayed?");
  await page.getByRole("button", { name: "Ask question", exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/investigations\/4821$/);
  await expect(
    page.getByText("Static activity log. No tools or AI models were executed."),
  ).toBeVisible();
  await page.getByRole("button", { name: "ALLOC-882", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("INSUFFICIENT_STOCK");
  await expect(dialog).toContainText("Local sample data");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .locator("[data-slot='evidence-event']")
    .filter({ hasText: "Stock unavailable" })
    .locator("summary")
    .click();
  await expect(page.locator("[data-slot='evidence-event'][open]")).toContainText("PO-1092");
});

test("unsupported questions explain the limitation and offer real demo paths", async ({
  page,
}) => {
  await page.goto("/demo/overview");
  await page
    .getByLabel("Ask a business question")
    .fill("Forecast next year's profit for order 4821");
  await page.getByRole("button", { name: "Ask question", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "This question is outside the demo",
  );
  await expect(page.getByRole("dialog")).toContainText(
    "does not run an AI model",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Why did revenue increase last week?" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("$29,468");
});

test("chart period changes its accessible data", async ({ page }) => {
  await page.goto("/demo/overview");
  const chart = page.getByRole("region", {
    name: "Weekly revenue chart",
    exact: true,
  });
  await page.getByLabel("Revenue chart period").selectOption("4");
  await chart.getByText("View chart data").click();
  await expect(chart.locator("tbody tr")).toHaveCount(4);
  await expect(chart).toContainText("$428,310");
  await page.getByLabel("Revenue chart period").selectOption("8");
  await expect(chart.locator("tbody tr")).toHaveCount(8);
});

test("follow-up, bookmark, and export controls work without executing actions", async ({
  page,
}) => {
  await page.goto("/demo/investigations/4821");
  await page
    .getByRole("button", { name: "When will stock arrive?", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Nov 25");
  await expect(page.getByRole("dialog")).toContainText(
    "not a confirmed promise",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Bookmark investigation" }).click();
  await expect(
    page.getByRole("button", { name: "Remove bookmark" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "More investigation options" })
    .click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Export sample records" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe(
    "bizbrain-demo-investigation-4821.json",
  );
  await page.getByRole("button", { name: /Update the customer/ }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "No action has been taken",
  );
  await expect(
    page.getByRole("button", { name: "Action execution coming later" }),
  ).toBeDisabled();
});

test("sidebar navigation, record filtering, and empty states work", async ({
  page,
}, testInfo) => {
  await page.goto("/demo/overview");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Knowledge" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Knowledge", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Filter sample records").fill("no matching record");
  await expect(page.getByText("No matching sample records")).toBeVisible();
  await page.getByRole("button", { name: "Clear filter" }).click();
  await expect(page.locator("[data-slot='knowledge-records'] details")).toHaveCount(4);
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Knowledge" }),
  ).toHaveAttribute("aria-current", "page");
});

test("search finds investigations and handles no results", async ({
  page,
}, testInfo) => {
  await page.goto("/demo/overview");
  if (testInfo.project.name === "mobile")
    await page
      .getByRole("button", { name: "Search workspace", exact: true })
      .click();
  else await page.locator("[data-slot='global-search']").click();
  await page.getByLabel("Search pages and investigations").fill("nonexistent");
  await expect(page.getByText("No sample results")).toBeVisible();
  await page.getByLabel("Search pages and investigations").fill("order 4821");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Why is order #4821 delayed/ })
    .click();
  await expect(page).toHaveURL(/\/demo\/investigations\/4821$/);
});

test("evidence dialogs support keyboard dismissal and restore focus", async ({
  page,
}) => {
  await page.goto("/demo/investigations/4821");
  const citation = page.getByRole("button", { name: "ALLOC-882", exact: true });
  await citation.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  // Audit the final colors, after the short dialog entrance animation settles.
  await expect(page.getByRole("dialog")).toHaveCSS("opacity", "1");
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({
        target,
        failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(citation).toBeFocused();
});

test("supporting routes stay accessible and contained", async ({ page }) => {
  for (const route of [
    "investigations",
    "connections",
    "knowledge",
    "history",
    "settings",
  ]) {
    await page.goto(`/demo/${route}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      accessibility.violations.map(({ id, nodes }) => ({
        route,
        id,
        nodes: nodes.map(({ target, failureSummary }) => ({
          target,
          failureSummary,
        })),
      })),
    ).toEqual([]);
  }
});

test("tablet layouts keep all primary content within the viewport", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Tablet sizes are checked once.",
  );
  await page.setViewportSize({ width: 834, height: 1112 });
  for (const route of primaryPages) {
    await page.goto(route.path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`${route.name}-tablet.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
});
