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

// function loadPostsFromXLSX is deprecated, using API now.
export async function loadPostsFromAPI(): Promise<RealPost[]> {
  try {
    const response = await fetch('/api/poles'); // Relative path using Vite Proxy
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json();

    // Map backend data to frontend interface
    const posts: RealPost[] = data.map((p: any) => ({
      id: p.id,
      idPoste: p.externalId,
      ips: p.ips || [],
      latitude: p.latitude,
      longitude: p.longitude,
      tipoLampada: p.lampType,
      potenciaW: Number(p.powerW) || 0, // Ensure number
    }));

    console.log(`Loaded ${posts.length} poles from API`);
    return posts;
  } catch (error) {
    console.error('Failed to load posts from API:', error);
    return [];
  }
}

export async function loadPostsFromXLSX(): Promise<RealPost[]> {
  console.warn("DEPRECATED: loadPostsFromXLSX is deprecated. Using loadPostsFromAPI instead.");
  return loadPostsFromAPI();
}
