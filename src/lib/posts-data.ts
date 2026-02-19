import * as XLSX from 'xlsx';

export interface RealPost {
  id: string;
  idPoste: string;
  ips: string[];
  latitude: number;
  longitude: number;
  tipoLampada: string;
  potenciaW: number;
  cep?: string;
  logradouro?: string;
}

let cachedPosts: RealPost[] | null = null;

export async function loadPostsFromXLSX(): Promise<RealPost[]> {
  if (cachedPosts) return cachedPosts;

  try {
    const response = await fetch('/data/BASE_INICIAL.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    // Group by ID_POSTE (unique posts with multiple IPs)
    const postMap = new Map<string, RealPost>();

    for (const row of rows) {
      const idPoste = String(row['ID_POSTE'] || '').trim();
      const idIp = String(row['ID_IP'] || '').trim();
      const lat = parseFloat(row['LATITUDE']);
      const lng = parseFloat(row['LONGITUDE']);

      if (!idPoste || isNaN(lat) || isNaN(lng)) continue;

      if (postMap.has(idPoste)) {
        const existing = postMap.get(idPoste)!;
        if (!existing.ips.includes(idIp)) {
          existing.ips.push(idIp);
        }
      } else {
        const cep = String(row['CEP'] || row['cep'] || '').trim();
        const logradouro = String(row['LOGRADOURO'] || row['RUA'] || row['ENDERECO'] || row['NOME_LOGRADOURO'] || '').trim();
        postMap.set(idPoste, {
          id: idPoste,
          idPoste,
          ips: [idIp],
          latitude: lat,
          longitude: lng,
          tipoLampada: String(row['TIPO_LAMPADA'] || ''),
          potenciaW: parseFloat(row['POTENCIA_W']) || 0,
          cep: cep || undefined,
          logradouro: logradouro || undefined,
        });
      }
    }

    cachedPosts = Array.from(postMap.values());
    console.log(`Loaded ${cachedPosts.length} unique posts from XLSX`);
    return cachedPosts;
  } catch (error) {
    console.error('Failed to load posts from XLSX:', error);
    return [];
  }
}
