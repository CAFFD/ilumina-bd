import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida. Configure o arquivo .env");
  process.exit(1);
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const db = drizzle(pool);
    console.log("⏳ Rodando migrações...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrações aplicadas com sucesso!");
  } finally {
    await pool.end();
    console.log("🔌 Conexão encerrada.");
  }
}

main().catch((err) => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
