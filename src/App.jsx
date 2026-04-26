import { useEffect, useMemo, useState } from 'react'
import data from './data.json'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const posterCache = new Map()
const MCU_SEARCH_TITLES = {
  1: 'Captain America: The First Avenger',
  2: 'Captain Marvel',
  3: 'Iron Man',
  4: 'Iron Man 2',
  5: 'The Incredible Hulk',
  6: 'Thor',
  7: 'The Avengers',
  8: 'Thor: The Dark World',
  9: 'Iron Man 3',
  10: 'Captain America: The Winter Soldier',
  11: 'Guardians of the Galaxy',
  12: 'Guardians of the Galaxy Vol. 2',
  13: 'Avengers: Age of Ultron',
  14: 'Ant-Man',
  15: 'Captain America: Civil War',
  16: 'Black Widow',
  17: 'Spider-Man: Homecoming',
  18: 'Black Panther',
  19: 'Doctor Strange',
  20: 'Thor: Ragnarok',
  21: 'Ant-Man and the Wasp',
  22: 'Avengers: Infinity War',
  23: 'Avengers: Endgame',
  24: 'Loki',
  25: 'What If...?',
  26: 'WandaVision',
  27: 'The Falcon and the Winter Soldier',
  28: 'Spider-Man: Far From Home',
  29: 'Shang-Chi and the Legend of the Ten Rings',
  30: 'Eternals',
  31: 'Spider-Man: No Way Home',
  32: 'Doctor Strange in the Multiverse of Madness',
  33: 'Hawkeye',
  34: 'Moon Knight',
  35: 'Black Panther: Wakanda Forever',
  36: 'Echo',
  37: 'She-Hulk: Attorney at Law',
  38: 'Ms. Marvel',
  39: 'Thor: Love and Thunder',
  40: 'Werewolf by Night',
  41: 'The Guardians of the Galaxy Holiday Special',
  42: 'Ant-Man and the Wasp: Quantumania',
  43: 'Guardians of the Galaxy Vol. 3',
  44: 'Secret Invasion',
  45: 'The Marvels',
  46: 'Deadpool & Wolverine',
  47: 'Agatha All Along',
  48: 'Captain America: Brave New World',
}

function PosterCard({ titulo, tituloBusqueda, tipo, visto }) {
  const [posterPath, setPosterPath] = useState('')
  const [cargando, setCargando] = useState(true)
  const apiKey = import.meta.env.VITE_TMDB_API_KEY
  const cacheKey = `${tipo}:${tituloBusqueda}`

  useEffect(() => {
    let activo = true

    const cargarPoster = async () => {
      if (!apiKey) {
        setCargando(false)
        return
      }

      if (posterCache.has(cacheKey)) {
        setPosterPath(posterCache.get(cacheKey))
        setCargando(false)
        return
      }

      try {
        const endpoint = tipo === 'serie' ? 'tv' : 'movie'
        const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(
          tituloBusqueda,
        )}&include_adult=false&language=en-US&page=1`
        const respuesta = await fetch(url)

        if (!respuesta.ok) {
          throw new Error('No se pudo consultar TMDB')
        }

        const json = await respuesta.json()
        const path = json?.results?.[0]?.poster_path ?? ''

        if (activo) {
          posterCache.set(cacheKey, path)
          setPosterPath(path)
        }
      } catch {
        if (activo) {
          posterCache.set(cacheKey, '')
          setPosterPath('')
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarPoster()
    return () => {
      activo = false
    }
  }, [apiKey, cacheKey, tipo, tituloBusqueda])

  if (cargando) {
    return (
      <div className="mb-3 flex h-48 w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-400">
        Cargando poster...
      </div>
    )
  }

  if (!posterPath) {
    return (
      <div className="mb-3 flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900 px-3 text-center text-sm text-slate-400">
        {titulo}
      </div>
    )
  }

  return (
    <img
      src={`${TMDB_IMAGE_BASE}${posterPath}`}
      alt={titulo}
      className={`mb-3 h-48 w-full rounded-lg object-cover transition duration-300 ${
        visto ? 'grayscale opacity-40' : ''
      }`}
      loading="lazy"
    />
  )
}

function App() {
  const [montado, setMontado] = useState(false)
  const [vistos, setVistos] = useState({})
  const [filtroTipo, setFiltroTipo] = useState('todo')
  const [filtroVisto, setFiltroVisto] = useState('todos')

  useEffect(() => {
    setMontado(true)
    const guardado = localStorage.getItem('mcu-vistos')

    if (guardado) {
      try {
        setVistos(JSON.parse(guardado))
      } catch {
        setVistos({})
      }
    }
  }, [])

  useEffect(() => {
    if (!montado) return
    localStorage.setItem('mcu-vistos', JSON.stringify(vistos))
  }, [vistos, montado])

  const estadisticas = useMemo(() => {
    const total = data.length
    const totalPeliculas = data.filter((item) => item.tipo === 'pelicula').length
    const totalSeries = data.filter((item) => item.tipo === 'serie').length

    const vistosTotal = data.filter((item) => vistos[item.id]).length
    const peliculasVistas = data.filter(
      (item) => item.tipo === 'pelicula' && vistos[item.id],
    ).length
    const seriesVistas = data.filter((item) => item.tipo === 'serie' && vistos[item.id]).length

    return {
      total,
      totalPeliculas,
      totalSeries,
      vistosTotal,
      peliculasVistas,
      seriesVistas,
    }
  }, [vistos])

  const alternarVisto = (id) => {
    setVistos((anterior) => ({
      ...anterior,
      [id]: !anterior[id],
    }))
  }

  const listaFiltrada = useMemo(() => {
    return data.filter((item) => {
      const cumpleTipo =
        filtroTipo === 'todo' ||
        (filtroTipo === 'series' && item.tipo === 'serie') ||
        (filtroTipo === 'pelis' && item.tipo === 'pelicula')

      const estaVisto = Boolean(vistos[item.id])
      const cumpleVisto =
        filtroVisto === 'todos' ||
        (filtroVisto === 'vistos' && estaVisto) ||
        (filtroVisto === 'no-vistos' && !estaVisto)

      return cumpleTipo && cumpleVisto
    })
  }, [filtroTipo, filtroVisto, vistos])

  if (!montado) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
        <p className="text-center text-slate-400">Cargando progreso del MCU...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-red-500 sm:text-3xl">MCU Tracker</h1>
              <p className="text-xs text-slate-400 sm:text-sm">Anotador de Universo Cinematografico Marvel de Santi y Clari</p>
            </div>
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
              {listaFiltrada.length} items visibles
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-slate-300">
              Total vistos: <span className="font-semibold text-slate-100">{estadisticas.vistosTotal}</span>/{estadisticas.total}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-slate-300">
              Pelis vistas: <span className="font-semibold text-slate-100">{estadisticas.peliculasVistas}</span>/{estadisticas.totalPeliculas}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-slate-300">
              Series vistas: <span className="font-semibold text-slate-100">{estadisticas.seriesVistas}</span>/{estadisticas.totalSeries}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'todo', label: 'Todo' },
                { key: 'series', label: 'Series' },
                { key: 'pelis', label: 'Pelis' },
              ].map((opcion) => (
                <button
                  key={opcion.key}
                  type="button"
                  onClick={() => setFiltroTipo(opcion.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    filtroTipo === opcion.key
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  {opcion.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'vistos', label: 'Vistos' },
                { key: 'no-vistos', label: 'No vistos' },
              ].map((opcion) => (
                <button
                  key={opcion.key}
                  type="button"
                  onClick={() => setFiltroVisto(opcion.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    filtroVisto === opcion.key
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  {opcion.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {listaFiltrada.map((item) => {
            const visto = Boolean(vistos[item.id])
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => alternarVisto(item.id)}
                className={`overflow-hidden rounded-2xl border p-4 text-left shadow-lg shadow-black/20 transition duration-300 ${
                  visto
                    ? 'border-slate-800 bg-slate-900/50 opacity-40 grayscale'
                    : 'border-slate-700 bg-slate-900/90 hover:-translate-y-1 hover:border-red-500 hover:bg-slate-800'
                }`}
              >
                <PosterCard
                  titulo={item.titulo}
                  tituloBusqueda={MCU_SEARCH_TITLES[item.id] ?? item.titulo}
                  tipo={item.tipo}
                  visto={visto}
                />
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  #{item.id} - {item.tipo}
                </p>
                <h2 className="text-sm font-semibold leading-snug text-slate-100 sm:text-base">
                  {item.titulo}
                </h2>
              </button>
            )
          })}
        </div>

        {listaFiltrada.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
            No hay resultados con los filtros actuales.
          </div>
        )}
      </section>
    </main>
  )
}

export default App
