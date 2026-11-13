import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const LOCAL = 'http://localhost:8000'
const HOSTED = 'https://rentangadi-backend-suman.onrender.com'

/**
 * Which backend this dev server talks to.
 *
 * The local one is preferred: it is where the newest code runs, and the
 * enquiry list only reports how far each enquiry got (pipelineStatus) there.
 * But it is not always running, and when it is not, every call used to fail
 * with ECONNREFUSED and the page showed "Unexpected end of JSON input" - an
 * error that says nothing about the real cause. So it is checked once at
 * startup and the hosted backend is used when it is not answering.
 *
 * The check runs at startup only. Start the local backend first, or restart
 * `npm run dev` after you do, to be served by it.
 */
const pickTarget = async () => {
  try {
    const stop = AbortSignal.timeout(1500)
    await fetch(LOCAL + '/api/quotations/TotalNumberOfquotation', { signal: stop })
    console.log('\n  API → local backend (' + LOCAL + ')\n')
    return LOCAL
  } catch {
    console.log(
      '\n  API → hosted backend (' +
        HOSTED +
        ')\n  The local backend is not answering on ' +
        LOCAL +
        '.\n  Start it and restart this dev server to use it instead.\n'
    )
    return HOSTED
  }
}

// https://vite.dev/config/
export default defineConfig(async () => {
  const target = await pickTarget()

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: target.startsWith('https'),
        },
      },
    },
  }
})
