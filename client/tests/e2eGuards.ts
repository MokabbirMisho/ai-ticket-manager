import { test } from "@playwright/test";

const dataWriteSkipMessage =
  "Skipping data-write E2E test because E2E_ALLOW_DATA_WRITES is not true or target URL is live.";

export const allowDataWrites = process.env.E2E_ALLOW_DATA_WRITES === "true";

export const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "";

export const isLiveUrl =
  baseUrl.includes("vercel.app") || baseUrl.includes("onrender.com");

export const skipDataWriteTestsUnlessAllowed = () => {
  test.skip(!allowDataWrites || isLiveUrl, dataWriteSkipMessage);
};
