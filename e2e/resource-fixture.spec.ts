import { createClerkClient } from "@clerk/nextjs/server";
import { expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { UserResource, type TestUser } from "./fixtures/UserResource";

test("異常系: データ準備の途中で失敗しても所有資源だけを回収する", async ({ bindings, user }) => {
  const failure = new Error("データ準備の途中失敗");
  let owned: TestUser | undefined;
  const otherKey = `profiles/${user.id}/retained.png`;
  await bindings.DB.prepare("INSERT INTO todos (id, title, user_id) VALUES (?, ?, ?)")
    .bind(crypto.randomUUID(), "別テストのTodo", user.id).run();
  await bindings.R2_BUCKET.put(otherKey, "別テストの画像");

  class InterruptedResource extends UserResource {
    protected async create(): Promise<TestUser> {
      owned = await super.create();
      await bindings.DB.prepare("INSERT INTO todos (id, title, user_id) VALUES (?, ?, ?)")
        .bind(crypto.randomUUID(), "途中で作成したTodo", owned.id).run();
      // No profile row: recover an image uploaded before the DB write failed.
      await bindings.R2_BUCKET.put(`profiles/${owned.id}/orphan.png`, "途中で作成した画像");
      throw failure;
    }
  }

  await expect(new InterruptedResource(bindings).run(async () => {
    throw new Error("準備に失敗した資源を使用してはいけません");
  })).rejects.toBe(failure);
  if (!owned) throw new Error("テストユーザーの作成を確認できませんでした");

  const count = (userId: string) => bindings.DB.prepare(
    "SELECT COUNT(*) AS count FROM todos WHERE user_id = ?"
  ).bind(userId).first<{ count: number }>();
  expect((await count(owned.id))?.count).toBe(0);
  expect((await bindings.R2_BUCKET.list({ prefix: `profiles/${owned.id}/` })).objects).toEqual([]);
  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  await expect(client.users.getUser(owned.id)).rejects.toMatchObject({ status: 404 });

  expect((await count(user.id))?.count).toBe(1);
  expect(await bindings.R2_BUCKET.head(otherKey)).not.toBeNull();
  expect((await client.users.getUser(user.id)).id).toBe(user.id);
});
