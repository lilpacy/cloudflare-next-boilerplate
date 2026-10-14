import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { getPlatformProxy, unstable_readConfig } from "wrangler";

export type TestBindings = Pick<CloudflareEnv, "DB" | "R2_BUCKET">;

export async function useCloudflareBindings(
  use: (bindings: TestBindings) => Promise<void>
): Promise<void> {
  const preview = process.env.E2E_ENV === "preview";
  const config = unstable_readConfig({
    config: "wrangler.jsonc",
    env: preview ? "preview" : undefined,
  }, { hideWarnings: true });
  const database = config.d1_databases.find(({ binding }: { binding: string }) => binding === "DB");
  const bucket = config.r2_buckets.find(({ binding }: { binding: string }) => binding === "R2_BUCKET");
  if (!database || !bucket) throw new Error("E2E requires DB and R2_BUCKET bindings");

  const directory = await mkdtemp(join(tmpdir(), "e2e-bindings-"));
  try {
    const configPath = join(directory, "wrangler.json");
    // Select only test data bindings; never copy app variables or secrets.
    await writeFile(configPath, JSON.stringify({
      name: "e2e-fixture-resources",
      compatibility_date: config.compatibility_date,
      d1_databases: [{ ...database, remote: preview }],
      r2_buckets: [{ ...bucket, remote: preview }],
    }));
    const proxy = await getPlatformProxy<TestBindings>({
      configPath,
      // Same local state directory as `next dev` / `wrangler`.
      persist: { path: resolve(".wrangler/state/v3") },
      remoteBindings: preview,
      envFiles: [],
    });
    try {
      await use(proxy.env);
    } finally {
      await proxy.dispose();
    }
  } finally {
    await rm(directory, { recursive: true });
  }
}
