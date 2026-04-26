import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const envPath = path.join(projectRoot, '.env.local')
const outputPath = path.join(projectRoot, 'src', 'tmdbPosterCache.json')

const MCU_SEARCH_TITLES = {
  1: { tipo: 'pelicula', titulo: 'Captain America: The First Avenger' },
  2: { tipo: 'pelicula', titulo: 'Captain Marvel' },
  3: { tipo: 'pelicula', titulo: 'Iron Man' },
  4: { tipo: 'pelicula', titulo: 'Iron Man 2' },
  5: { tipo: 'pelicula', titulo: 'The Incredible Hulk' },
  6: { tipo: 'pelicula', titulo: 'Thor' },
  7: { tipo: 'pelicula', titulo: 'The Avengers' },
  8: { tipo: 'pelicula', titulo: 'Thor: The Dark World' },
  9: { tipo: 'pelicula', titulo: 'Iron Man 3' },
  10: { tipo: 'pelicula', titulo: 'Captain America: The Winter Soldier' },
  11: { tipo: 'pelicula', titulo: 'Guardians of the Galaxy' },
  12: { tipo: 'pelicula', titulo: 'Guardians of the Galaxy Vol. 2' },
  13: { tipo: 'pelicula', titulo: 'Avengers: Age of Ultron' },
  14: { tipo: 'pelicula', titulo: 'Ant-Man' },
  15: { tipo: 'pelicula', titulo: 'Captain America: Civil War' },
  16: { tipo: 'pelicula', titulo: 'Black Widow' },
  17: { tipo: 'pelicula', titulo: 'Spider-Man: Homecoming' },
  18: { tipo: 'pelicula', titulo: 'Black Panther' },
  19: { tipo: 'pelicula', titulo: 'Doctor Strange' },
  20: { tipo: 'pelicula', titulo: 'Thor: Ragnarok' },
  21: { tipo: 'pelicula', titulo: 'Ant-Man and the Wasp' },
  22: { tipo: 'pelicula', titulo: 'Avengers: Infinity War' },
  23: { tipo: 'pelicula', titulo: 'Avengers: Endgame' },
  24: { tipo: 'serie', titulo: 'Loki' },
  25: { tipo: 'serie', titulo: 'What If...?' },
  26: { tipo: 'serie', titulo: 'WandaVision' },
  27: { tipo: 'serie', titulo: 'The Falcon and the Winter Soldier' },
  28: { tipo: 'pelicula', titulo: 'Spider-Man: Far From Home' },
  29: { tipo: 'pelicula', titulo: 'Shang-Chi and the Legend of the Ten Rings' },
  30: { tipo: 'pelicula', titulo: 'Eternals' },
  31: { tipo: 'pelicula', titulo: 'Spider-Man: No Way Home' },
  32: { tipo: 'pelicula', titulo: 'Doctor Strange in the Multiverse of Madness' },
  33: { tipo: 'serie', titulo: 'Hawkeye' },
  34: { tipo: 'serie', titulo: 'Moon Knight' },
  35: { tipo: 'pelicula', titulo: 'Black Panther: Wakanda Forever' },
  36: { tipo: 'serie', titulo: 'Echo' },
  37: { tipo: 'serie', titulo: 'She-Hulk: Attorney at Law' },
  38: { tipo: 'serie', titulo: 'Ms. Marvel' },
  39: { tipo: 'pelicula', titulo: 'Thor: Love and Thunder' },
  40: { tipo: 'pelicula', titulo: 'Werewolf by Night' },
  41: { tipo: 'pelicula', titulo: 'The Guardians of the Galaxy Holiday Special' },
  42: { tipo: 'pelicula', titulo: 'Ant-Man and the Wasp: Quantumania' },
  43: { tipo: 'pelicula', titulo: 'Guardians of the Galaxy Vol. 3' },
  44: { tipo: 'serie', titulo: 'Secret Invasion' },
  45: { tipo: 'pelicula', titulo: 'The Marvels' },
  46: { tipo: 'pelicula', titulo: 'Deadpool & Wolverine' },
  47: { tipo: 'serie', titulo: 'Agatha All Along' },
  48: { tipo: 'pelicula', titulo: 'Captain America: Brave New World' },
}

const parseEnv = (raw) => {
  const lines = raw.split('\n')
  const env = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx <= 0) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }

  return env
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getPosterPath = async (apiKey, tipo, titulo) => {
  const endpoint = tipo === 'serie' ? 'tv' : 'movie'
  const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(
    titulo,
  )}&include_adult=false&language=en-US&page=1`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`TMDB error ${response.status} buscando "${titulo}"`)
  }
  const json = await response.json()
  return json?.results?.[0]?.poster_path ?? ''
}

const main = async () => {
  const envRaw = await fs.readFile(envPath, 'utf-8')
  const env = parseEnv(envRaw)
  const apiKey = env.VITE_TMDB_API_KEY

  if (!apiKey) {
    throw new Error('No se encontro VITE_TMDB_API_KEY en .env.local')
  }

  const out = {}

  for (const id of Object.keys(MCU_SEARCH_TITLES).map(Number).sort((a, b) => a - b)) {
    const { tipo, titulo } = MCU_SEARCH_TITLES[id]
    const key = `${tipo}:${titulo}`
    const poster = await getPosterPath(apiKey, tipo, titulo)
    out[key] = poster
    await sleep(80)
  }

  await fs.writeFile(outputPath, `${JSON.stringify(out, null, 2)}\n`, 'utf-8')
  console.log(`Cache generado con ${Object.keys(out).length} entradas en src/tmdbPosterCache.json`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
