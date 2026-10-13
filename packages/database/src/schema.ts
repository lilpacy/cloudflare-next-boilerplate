// Every module's tables are registered here. drizzle-kit reads this file to generate
// migrations, and createDb() passes it to drizzle, so the two cannot disagree.
export * from "./modules/todos/schema";
export * from "./modules/users/schema";
