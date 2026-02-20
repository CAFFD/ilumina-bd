import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import { users, profiles, userRoles } from "./schema.js";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida. Configure o arquivo .env");
  process.exit(1);
}

async function main() {
  console.log("👤 Verificando usuário admin...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    const adminEmail = "admin@ilumina.com";
    const existingUser = await db.select().from(users).where(eq(users.email, adminEmail));

    if (existingUser.length === 0) {
        console.log("🆕 Criando usuário admin padrão...");
        const passwordHash = await hash("admin123", 6);
        
        const [newUser] = await db.insert(users).values({
            email: adminEmail,
            password: passwordHash,
            name: "Administrador",
        }).returning();

        await db.insert(profiles).values({
            userId: newUser.id,
            fullName: "Administrador do Sistema",
            phone: "(00) 00000-0000",
        });

        await db.insert(userRoles).values({
            userId: newUser.id,
            role: "admin",
        });
        console.log(`✅ Usuário admin criado com sucesso!`);
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Senha: admin123`);
    } else {
        console.log("ℹ️ Usuário admin já existe.");
    }
  } catch (err) { 
    console.error("❌ Erro ao criar admin:", err);
  } finally {
    await pool.end();
    console.log("🔌 Conexão encerrada.");
  }
}

main().catch((err) => {
  console.error("❌ Erro no script:", err);
  process.exit(1);
});
