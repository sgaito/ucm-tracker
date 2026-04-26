import { kv } from '@vercel/kv'

const KEY = 'mcu_progress_global'

const enviar = (res, code, payload) => {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const vistos = (await kv.get(KEY)) ?? {}
      return enviar(res, 200, { vistos })
    }

    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body || '{}')
          : req.body || {}
      const vistos = body.vistos && typeof body.vistos === 'object' ? body.vistos : {}

      await kv.set(KEY, vistos)
      return enviar(res, 200, { ok: true })
    }

    return enviar(res, 405, { error: 'Metodo no permitido' })
  } catch (error) {
    return enviar(res, 500, {
      error: 'Error guardando/cargando progreso global',
      detalle: error?.message ?? 'Error desconocido',
    })
  }
}
