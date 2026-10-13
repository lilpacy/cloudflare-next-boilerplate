import { describe, expect, it } from "vitest";
import { ResourceFixture } from "../e2e/fixtures/ResourceFixture";

type Phase = "create" | "precheck" | "use";

class ExampleResource extends ResourceFixture<string> {
  acquired = false;
  checked = false;
  cleaned = false;
  readonly failure = new Error("fixture failure");
  readonly cleanupFailure = new Error("cleanup failure");

  constructor(
    private readonly failingPhase?: Phase,
    private readonly failCleanup = false
  ) {
    super();
  }

  protected async create(): Promise<string> {
    this.acquired = true;
    if (this.failingPhase === "create") throw this.failure;
    return "owned resource";
  }

  protected async precheck(): Promise<void> {
    this.checked = true;
    if (this.failingPhase === "precheck") throw this.failure;
  }

  protected async cleanup(): Promise<void> {
    this.cleaned = this.acquired;
    if (this.failCleanup) throw this.cleanupFailure;
  }
}

const phases = [
  { label: "準備中", phase: "create" },
  { label: "事前確認中", phase: "precheck" },
  { label: "テスト実行中", phase: "use" },
] as const;

describe("テスト資源のライフサイクル", () => {
  it("正常系: 事前確認が済んだ資源を使用し、終了時に回収する", async () => {
    const fixture = new ExampleResource();
    let used = false;
    await fixture.run(async (resource) => {
      expect(resource).toBe("owned resource");
      expect(fixture.checked).toBe(true);
      expect(fixture.cleaned).toBe(false);
      used = true;
    });
    expect(used).toBe(true);
    expect(fixture.cleaned).toBe(true);
  });

  it.each(phases)("異常系: $labelに失敗しても取得済み資源を回収し、元のエラーを返す", async ({ phase }) => {
    const fixture = new ExampleResource(phase);
    let used = false;
    await expect(fixture.run(async () => {
      used = true;
      if (phase === "use") throw fixture.failure;
    })).rejects.toBe(fixture.failure);
    expect(used).toBe(phase === "use");
    expect(fixture.cleaned).toBe(true);
  });

  it.each(phases)("異常系: $labelと回収が両方失敗すると両方のエラーを返す", async ({ phase }) => {
    const fixture = new ExampleResource(phase, true);
    await expect(fixture.run(async () => {
      if (phase === "use") throw fixture.failure;
    })).rejects.toMatchObject({
      name: "AggregateError",
      message: "fixtureの処理と後始末が失敗しました",
      errors: [fixture.failure, fixture.cleanupFailure],
    });
    expect(fixture.cleaned).toBe(true);
  });

  it("異常系: 回収だけが失敗した場合は回収のエラーを返す", async () => {
    const fixture = new ExampleResource(undefined, true);
    await expect(fixture.run(async (resource) => {
      expect(resource).toBe("owned resource");
    })).rejects.toBe(fixture.cleanupFailure);
  });
});
