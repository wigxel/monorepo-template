import chalk from "chalk";
import "dotenv/config";
import type { Config } from "drizzle-kit";

const connectionString = process.env.DB_URL;

if (!connectionString) {
  console.log("\n\n");
  console.log(
    `${chalk.red("→ DB connection required")}\n${chalk.white(
      `Ensure ${chalk.blueBright("`DB_URL`")} is present in environment file`,
    )}`,
  );
  console.log("\n");
  process.exit(0);
}

export default {
  schema: "./migrations/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString,
  },
} satisfies Config;
