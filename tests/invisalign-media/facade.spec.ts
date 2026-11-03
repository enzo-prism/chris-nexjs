import { expect, test, type Page, type Request } from "@playwright/test";

const THIRD_PARTY =
  /youtube|youtu\.be|ytimg|googlevideo|vimeo|vimeocdn|i\.vimeocdn/i;

function isThirdPartyMedia(url: string): boolean {
  return THIRD_PARTY.test(url);
}

async function waitForMediaHeading(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /invisalign,\s+up close/i }),
  ).toBeVisible();
}

test("file facade stays lazy and mounts English captions after click", async ({
  page,
}) => {
  await page.goto("/dev/invisalign-media");
  await waitForMediaHeading(page);

  const images = page.locator("#invisalign-media img");
  await expect(images.first()).toBeVisible();
  const imageCount = await images.count();
  expect(imageCount).toBeGreaterThan(0);

  for (let index = 0; index < imageCount; index += 1) {
    const image = images.nth(index);
    await expect(image).toHaveAttribute("loading", "lazy");
    await expect(image).not.toHaveAttribute("fetchpriority", "high");
    await expect(image).not.toHaveAttribute("loading", "eager");
  }

  await expect(page.locator("#invisalign-media video")).toHaveCount(0);
  await expect(page.locator("#invisalign-media iframe")).toHaveCount(0);

  const play = page.getByRole("button", {
    name: /play video: fixture video 1/i,
  });
  await expect(play).toBeVisible();
  await play.click();

  const video = page.locator("#invisalign-media video").first();
  await expect(video).toBeVisible();
  const track = video.locator("track");
  await expect(track).toHaveAttribute("kind", "captions");
  await expect(track).toHaveAttribute("srclang", "en");
  await expect(track).toHaveAttribute("src");
  await expect(video).toBeFocused();
  await expect(page.locator("#invisalign-media iframe")).toHaveCount(0);
});

test("embed iframe appears only after click and makes no third-party requests before", async ({
  page,
}) => {
  const thirdPartyBeforeClick: string[] = [];
  let clicked = false;

  const onRequest = (request: Request): void => {
    if (clicked) return;
    if (isThirdPartyMedia(request.url())) {
      thirdPartyBeforeClick.push(request.url());
    }
  };

  page.on("request", onRequest);

  await page.goto("/dev/invisalign-media?embed=1");
  await waitForMediaHeading(page);

  const poster = page.locator("#invisalign-media img").first();
  await expect(poster).toBeVisible();
  await expect(poster).toHaveAttribute("loading", "lazy");
  await expect(poster).not.toHaveAttribute("fetchpriority", "high");
  await expect(poster).toHaveAttribute("data-nimg");

  await expect(page.locator("#invisalign-media iframe")).toHaveCount(0);
  await expect(page.locator("#invisalign-media video")).toHaveCount(0);
  expect(thirdPartyBeforeClick).toEqual([]);

  clicked = true;
  page.off("request", onRequest);

  await page
    .getByRole("button", { name: /play video: fixture embed/i })
    .click();

  const iframe = page.locator("#invisalign-media iframe").first();
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute(
    "src",
    /https:\/\/www\.youtube-nocookie\.com\/.*autoplay=1/,
  );
  await expect(iframe).toBeFocused();
});
