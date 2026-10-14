/** テストごとに生成し、runは上書きせず1回だけ呼ぶ。 */
export abstract class ResourceFixture<R> {
  public async run(use: (resources: R) => Promise<void>): Promise<void> {
    const errors: unknown[] = [];
    try {
      const resources = await this.create();
      await this.precheck(resources);
      await use(resources);
    } catch (error) {
      errors.push(error);
    }

    try {
      await this.cleanup();
    } catch (error) {
      errors.push(error);
    }

    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      throw new AggregateError(errors, "fixtureの処理と後始末が失敗しました");
    }
  }

  protected abstract create(): Promise<R>;
  protected abstract precheck(resources: R): Promise<void>;
  // createの途中失敗でも呼ばれるため、取得済みの所有資源だけを回収する。
  protected abstract cleanup(): Promise<void>;
}
