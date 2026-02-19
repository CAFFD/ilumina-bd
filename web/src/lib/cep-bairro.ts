// CEP → Bairro mapping for Palmital, SP

interface CepRange {
  bairro: string;
  cepInicio: number;
  cepFim: number;
}

const CEP_RANGES: CepRange[] = [
  { bairro: "Área Rural de Palmital", cepInicio: 19978899, cepFim: 19978899 },
  { bairro: "Área Rural de Sussui", cepInicio: 19979899, cepFim: 19979899 },
  { bairro: "Centro", cepInicio: 19970050, cepFim: 19970970 },
  { bairro: "Centro (Sussui)", cepInicio: 19979000, cepFim: 19979016 },
  { bairro: "Conj. Hab. Albino Rainho", cepInicio: 19971200, cepFim: 19971218 },
  { bairro: "Conj. Hab. Miguel Huertas", cepInicio: 19971000, cepFim: 19971022 },
  { bairro: "Conj. Hab. Padre Inocente Osés", cepInicio: 19971030, cepFim: 19971036 },
  { bairro: "Distrito Industrial Basílio", cepInicio: 19973610, cepFim: 19973618 },
  { bairro: "Distrito Industrial III", cepInicio: 19977200, cepFim: 19977210 },
  { bairro: "Golden Park", cepInicio: 19973620, cepFim: 19973630 },
  { bairro: "Jardim Avenida", cepInicio: 19970001, cepFim: 19970005 },
  { bairro: "Jardim Bela Vista", cepInicio: 19973170, cepFim: 19973190 },
  { bairro: "Jardim das Flores", cepInicio: 19970120, cepFim: 19970146 },
  { bairro: "Jardim das Oliveiras", cepInicio: 19970350, cepFim: 19970354 },
  { bairro: "Jardim Montreal", cepInicio: 19973710, cepFim: 19973734 },
  { bairro: "Jardim Novo Mundo", cepInicio: 19970360, cepFim: 19970374 },
  { bairro: "Jardim Olímpico", cepInicio: 19971220, cepFim: 19971232 },
  { bairro: "Jardim Paulista", cepInicio: 19971130, cepFim: 19971140 },
  { bairro: "Jardim Residencial Holmo", cepInicio: 19970300, cepFim: 19970308 },
  { bairro: "Jardim Santa Lucia", cepInicio: 19973650, cepFim: 19973654 },
  { bairro: "Paraná", cepInicio: 19973120, cepFim: 19973160 },
  { bairro: "Parque dos Antúrios", cepInicio: 19973230, cepFim: 19973240 },
  { bairro: "Parque Independência", cepInicio: 19970330, cepFim: 19970340 },
  { bairro: "Parque São Jorge", cepInicio: 19973000, cepFim: 19973010 },
  { bairro: "Residencial Afonso Negrão", cepInicio: 19971110, cepFim: 19971128 },
  { bairro: "Residencial Arboris Palmital", cepInicio: 19970380, cepFim: 19970392 },
  { bairro: "Residencial Fenix I", cepInicio: 19973510, cepFim: 19973518 },
  { bairro: "Residencial Fênix II", cepInicio: 19973520, cepFim: 19973528 },
  { bairro: "Residencial Imperial", cepInicio: 19973250, cepFim: 19973258 },
  { bairro: "São José", cepInicio: 19971060, cepFim: 19971068 },
  { bairro: "Toninho Costa", cepInicio: 19973640, cepFim: 19973640 },
  { bairro: "Vila Albino", cepInicio: 19973530, cepFim: 19973536 },
  { bairro: "Vila América", cepInicio: 19971040, cepFim: 19971052 },
  { bairro: "Vila Mazzeto", cepInicio: 19973100, cepFim: 19973110 },
  { bairro: "Vila Nova Zanete", cepInicio: 19971090, cepFim: 19971106 },
  { bairro: "Vila Santa Terezinha", cepInicio: 19971070, cepFim: 19971088 },
  { bairro: "Vila Volga", cepInicio: 19970310, cepFim: 19970324 },
  { bairro: "Vila Wady Zugaiar", cepInicio: 19973200, cepFim: 19973228 },
];

function normalizeCep(cep: string): number {
  return parseInt(cep.replace(/\D/g, ""), 10);
}

export function getBairroByCep(cep: string | undefined | null): string {
  if (!cep) return "Bairro não identificado";
  const num = normalizeCep(cep);
  if (isNaN(num)) return "Bairro não identificado";

  for (const range of CEP_RANGES) {
    if (num >= range.cepInicio && num <= range.cepFim) {
      return range.bairro;
    }
  }
  return "Bairro não identificado";
}

export function getAllBairros(): string[] {
  return CEP_RANGES.map((r) => r.bairro).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
