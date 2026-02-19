import * as path from "path";
import * as fs from "fs";
import * as XLSX from "xlsx";
import pg from "pg";
const { Pool } = pg;
import { drizzle } from "drizzle-orm/node-postgres";
import { poles } from "./schema";

import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida. Configure o arquivo .env");
  process.exit(1);
}

const BATCH_SIZE = 100;
const XLSX_PATH = path.resolve(process.cwd(), "public/data/BASE_INICIAL.xlsx");

interface RawRow {
  ID_POSTE?: string | number;
  ID_IP?: string | number;
  CIDADE?: string;
  TIPO_LAMPADA?: string;
  POTENCIA_W?: string | number;
  LATITUDE?: string | number;
  LONGITUDE?: string | number;
}

function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  const str = String(value).replace(",", ".");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

async function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`❌ Arquivo não encontrado: ${XLSX_PATH}`);
    process.exit(1);
  }

  console.log(`📄 Lendo ${XLSX_PATH}...`);
  try {
      const fileBuffer = fs.readFileSync(XLSX_PATH);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // @ts-ignore
      const rows = XLSX.utils.sheet_to_json<RawRow>(sheet);
      console.log(`📊 ${rows.length} linhas encontradas no XLSX.`);

      const records: (typeof poles.$inferInsert)[] = [];

      for (const row of rows) {
        const idIp = String(row.ID_IP ?? "").trim();
        // Handle potential numeric inputs for coordinates
        const lat = typeof row.LATITUDE === 'number' ? row.LATITUDE : parseNumber(row.LATITUDE);
        const lng = typeof row.LONGITUDE === 'number' ? row.LONGITUDE : parseNumber(row.LONGITUDE);

        if (!idIp || lat === 0 || lng === 0) {
          continue; // Pular linhas sem dados essenciais
        }

        const idPoste = String(row.ID_POSTE ?? "").trim();

        records.push({
          externalId: idIp,
          latitude: lat,
          longitude: lng,
          lampType: String(row.TIPO_LAMPADA ?? "").trim() || null,
          powerW: String(Math.round(parseNumber(row.POTENCIA_W))),
          ips: idPoste ? [idPoste] : [],
          addressId: null,
        });
      }

      console.log(`✅ ${records.length} registros válidos preparados.`);

      if (records.length === 0) {
        console.warn("⚠️ Nenhum registro para inserir. Verifique o arquivo.");
        process.exit(0);
      }

      // 3. Conectar ao banco e inserir em lotes
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });

      try {
        const db = drizzle(pool);
        let inserted = 0;
        let skipped = 0;

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batch = records.slice(i, i + BATCH_SIZE);

          const result = await db
            .insert(poles)
            .values(batch)
            .onConflictDoNothing({ target: poles.externalId })
            .returning({ id: poles.id });

          inserted += result.length;
          skipped += batch.length - result.length;

          const progress = Math.min(i + BATCH_SIZE, records.length);
          console.log(`⏳ ${progress}/${records.length} processados (${result.length} inseridos neste lote)`);
        }

        console.log(`\n🎉 Seed finalizado!`);
        console.log(`   ✅ Inseridos: ${inserted}`);
        console.log(`   ⏭️  Ignorados (já existiam): ${skipped}`);
      } finally {
        await pool.end();
        console.log("🔌 Conexão encerrada.");
      }

  } catch (error) {
      console.error("❌ Erro fatal durante a leitura/processamento:", error);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
