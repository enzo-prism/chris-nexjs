import { runSeoAll } from "./seo-all-lib.mjs";

runSeoAll().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
