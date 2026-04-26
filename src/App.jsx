import { useEffect, useMemo, useState } from 'react'
import data from './data.json'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const posterCache = new Map()

function PosterCard({ titulo, tipo, visto }) {
  const [posterPath, setPosterPath] = useState('')
  const [cargando, setCargando] = useState(true)
  const apiKey = import.meta.env.VITE_TMDB_API_KEY
  const cacheKey = `${tipo}:${titulo}`

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
          titulo,
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
  }, [apiKey, cacheKey, tipo, titulo])

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

  if (!montado) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100">
        <p className="text-center text-zinc-400">Cargando progreso del MCU...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-red-500">MCU Tracker</h1>
          <div className="grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-3">
            <p>
              Total vistos: <span className="font-semibold text-slate-100">{estadisticas.vistosTotal}</span>/
              {estadisticas.total}
            </p>
            <p>
              Peliculas vistas:{' '}
              <span className="font-semibold text-slate-100">{estadisticas.peliculasVistas}</span>/
              {estadisticas.totalPeliculas}
            </p>
            <p>
              Series vistas: <span className="font-semibold text-slate-100">{estadisticas.seriesVistas}</span>/
              {estadisticas.totalSeries}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.map((item) => {
            const visto = Boolean(vistos[item.id])
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => alternarVisto(item.id)}
                className={`overflow-hidden rounded-xl border p-4 text-left transition duration-200 ${
                  visto
                    ? 'border-slate-800 bg-slate-900/40 opacity-40 grayscale'
                    : 'border-slate-700 bg-slate-900 hover:border-red-500 hover:bg-slate-800'
                }`}
              >
                <PosterCard titulo={item.titulo} tipo={item.tipo} visto={visto} />
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
      </section>
    </main>
  )
}

export default App
