import { useEffect, useMemo, useState } from 'react'
import data from './data.json'

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
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-red-500">MCU Tracker</h1>
          <div className="grid grid-cols-1 gap-2 text-sm text-zinc-300 sm:grid-cols-3">
            <p>
              Total vistos: <span className="font-semibold text-zinc-100">{estadisticas.vistosTotal}</span>/
              {estadisticas.total}
            </p>
            <p>
              Peliculas vistas:{' '}
              <span className="font-semibold text-zinc-100">{estadisticas.peliculasVistas}</span>/
              {estadisticas.totalPeliculas}
            </p>
            <p>
              Series vistas: <span className="font-semibold text-zinc-100">{estadisticas.seriesVistas}</span>/
              {estadisticas.totalSeries}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((item) => {
            const visto = Boolean(vistos[item.id])
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => alternarVisto(item.id)}
                className={`overflow-hidden rounded-xl border p-4 text-left transition duration-200 ${
                  visto
                    ? 'border-zinc-800 bg-zinc-900/40 opacity-40 grayscale saturate-0'
                    : 'border-zinc-700 bg-zinc-900 hover:border-red-500 hover:bg-zinc-800'
                }`}
              >
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="mb-3 max-h-[26rem] w-full rounded-lg bg-zinc-950 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="mb-3 flex h-44 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800 text-xs text-zinc-500">
                    Sin imagen
                  </div>
                )}
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  #{item.id} - {item.tipo}
                </p>
                <h2 className="text-sm font-semibold leading-snug text-zinc-100 sm:text-base">
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
