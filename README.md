# MCU Tracker

Aplicacion web para llevar el progreso de visionado del MCU con React, Vite y Tailwind CSS.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de produccion

```bash
npm run build
npm run preview
```

## Deploy en Vercel

El repo ya incluye `vercel.json` con:

- `framework`: `vite`
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- `rewrites` para servir `index.html` en rutas del cliente

Pasos:

1. Subi este proyecto a GitHub.
2. En Vercel, elegi **Add New Project** e importa el repo.
3. Verifica que detecte:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy.
