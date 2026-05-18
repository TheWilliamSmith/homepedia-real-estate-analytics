import 'dotenv/config';
import cliProgress from 'cli-progress';
import { PrismaService } from '../src/prisma/prisma.service.js';

const prisma = new PrismaService();

const WORLD_BANK_BASE = 'https://api.worldbank.org/v2';
const INDICATOR = 'NY.GDP.PCAP.CD';
const PAGE_SIZE = 300;

interface WorldBankCountry {
  id: string;
  iso2Code: string;
  name: string;
  region: { id: string; value: string };
  incomeLevel: { id: string; value: string };
}

interface WorldBankEntry {
  country: { id: string; value: string };
  countryiso3code: string;
  value: number | null;
  date: string;
}

function buildRealCountrySet(countries: WorldBankCountry[]): Set<string> {
  return new Set(
    countries.filter((c) => c.region.id !== 'NA').map((c) => c.id),
  );
}

async function fetchAllCountries(): Promise<WorldBankCountry[]> {
  const url = `${WORLD_BANK_BASE}/country?format=json&per_page=500`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch countries: ${res.status}`);
  const [, data] = (await res.json()) as [unknown, WorldBankCountry[]];
  return data;
}

async function fetchGdp(year: number): Promise<WorldBankEntry[]> {
  const results: WorldBankEntry[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `${WORLD_BANK_BASE}/country/all/indicator/${INDICATOR}?format=json&date=${year}&per_page=${PAGE_SIZE}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`Failed to fetch GDP page ${page}: ${res.status}`);
    const [meta, data] = (await res.json()) as [
      { pages: number },
      WorldBankEntry[],
    ];
    totalPages = meta.pages;
    if (Array.isArray(data)) results.push(...data);
    page++;
  } while (page <= totalPages);

  return results;
}

interface Stats {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

async function upsertCountryAndGdp(
  entry: WorldBankEntry,
  countryMeta: Map<string, WorldBankCountry>,
  year: number,
  stats: Stats,
): Promise<void> {
  const iso3 = entry.countryiso3code;
  const meta = countryMeta.get(iso3);

  try {
    const country = await prisma.country.upsert({
      where: { iso3 },
      create: {
        iso3,
        iso2: meta?.iso2Code ?? null,
        name: entry.country.value,
        region: meta?.region?.value ?? null,
        incomeLevel: meta?.incomeLevel?.value ?? null,
      },
      update: {
        name: entry.country.value,
        region: meta?.region?.value ?? null,
        incomeLevel: meta?.incomeLevel?.value ?? null,
      },
    });

    if (entry.value === null) {
      stats.skipped++;
      return;
    }

    const existing = await prisma.gdpData.findUnique({
      where: { countryId_year: { countryId: country.id, year } },
    });

    await prisma.gdpData.upsert({
      where: { countryId_year: { countryId: country.id, year } },
      create: { countryId: country.id, year, value: entry.value },
      update: { value: entry.value },
    });

    if (existing) {
      stats.updated++;
    } else {
      stats.inserted++;
    }
  } catch (err) {
    stats.errors++;
    console.error(`\nError processing ${iso3}: ${(err as Error).message}`);
  }
}

async function main() {
  const year = parseInt(process.argv[2] ?? '2023', 10);

  console.log(`\nHomepedia — GDP per capita ingestion for year ${year}`);
  console.log('─'.repeat(50));

  console.log('Fetching country metadata from World Bank...');
  const allCountries = await fetchAllCountries();
  const realCountryIso3s = buildRealCountrySet(allCountries);
  const countryMeta = new Map(allCountries.map((c) => [c.id, c]));

  console.log(`Fetching GDP data (indicator ${INDICATOR})...`);
  const allEntries = await fetchGdp(year);

  const realCountries = allEntries.filter((e) =>
    realCountryIso3s.has(e.countryiso3code),
  );

  console.log(
    `Found ${realCountries.length} real countries (filtered out ${allEntries.length - realCountries.length} aggregates).\n`,
  );

  const stats: Stats = {
    total: realCountries.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  const bar = new cliProgress.SingleBar(
    {
      format: ' {bar} {percentage}% | {value}/{total} | {countryName}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      clearOnComplete: false,
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  );

  bar.start(stats.total, 0, { countryName: '' });

  for (let i = 0; i < realCountries.length; i++) {
    const entry = realCountries[i];
    bar.update(i, { countryName: entry.country.value.padEnd(40).slice(0, 40) });
    await upsertCountryAndGdp(entry, countryMeta, year, stats);
  }

  bar.update(stats.total, { countryName: 'Done'.padEnd(40) });
  bar.stop();

  console.log('\n' + '─'.repeat(50));
  console.log('Ingestion complete — Summary');
  console.log('─'.repeat(50));
  console.log(`  Total countries processed : ${stats.total}`);
  console.log(`  Inserted                  : ${stats.inserted}`);
  console.log(`  Updated                   : ${stats.updated}`);
  console.log(`  Skipped (no data)         : ${stats.skipped}`);
  console.log(`  Errors                    : ${stats.errors}`);
  console.log('─'.repeat(50) + '\n');
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.onModuleDestroy());
