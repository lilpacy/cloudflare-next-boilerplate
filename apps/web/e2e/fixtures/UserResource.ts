import { createClerkClient } from "@clerk/nextjs/server";
import { expect } from "@playwright/test";
import type { TestBindings } from "./CloudflareBindings";
import { ResourceFixture } from "./ResourceFixture";

export type TestUser = { id: string; email: string };

export class UserResource extends ResourceFixture<TestUser> {
  private user?: TestUser;
  private readonly client;

  constructor(private readonly bindings: TestBindings) {
    super();
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey?.startsWith("sk_test_")) {
      throw new Error("E2E requires a Clerk test secret key");
    }
    this.client = createClerkClient({ secretKey });
  }

  protected async create(): Promise<TestUser> {
    const email = `e2e-${crypto.randomUUID()}+clerk_test@example.com`;
    const user = await this.client.users.createUser({
      emailAddress: [email],
      password: `e2e-${crypto.randomUUID()}`,
    });
    this.user = { id: user.id, email };
    return this.user;
  }

  protected async precheck(user: TestUser): Promise<void> {
    const row = await this.bindings.DB.prepare(
      "SELECT COUNT(*) AS count FROM todos WHERE user_id = ?"
    ).bind(user.id).first<{ count: number }>();
    expect(row?.count).toBe(0);
  }

  protected async cleanup(): Promise<void> {
    if (!this.user) return;
    const { id } = this.user;
    const results = await Promise.allSettled([
      deleteProfileImages(this.bindings, id),
      this.bindings.DB.prepare("DELETE FROM todos WHERE user_id = ?").bind(id).run(),
      this.bindings.DB.prepare("DELETE FROM users WHERE user_id = ?").bind(id).run(),
      this.client.users.deleteUser(id),
    ]);
    const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason] : []);
    if (errors.length) throw new AggregateError(errors, "テストユーザーの資源回収に失敗しました");
  }
}

export async function deleteProfileImages(
  bindings: TestBindings,
  userId: string
): Promise<void> {
  let cursor: string | undefined;
  do {
    const listing = await bindings.R2_BUCKET.list({
      prefix: `profiles/${userId}/`,
      cursor,
    });
    if (listing.objects.length) {
      await bindings.R2_BUCKET.delete(listing.objects.map(({ key }) => key));
    }
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);
}
