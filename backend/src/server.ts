// backend/src/server.ts

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { serve } from '@hono/node-server'

const app = new Hono().basePath('/api')

// 1. Habilitamos CORS (Crucial para que el Frontend y Backend se hablen)
app.use('*', cors())

// 2. Endpoint de Telemetría/Salud (Para saber si el servidor está vivo)
app.get('/health', (c) => c.json({ status: 'Operacional', platform: 'OmniEdge Core' }))

// 3. Endpoint Principal del Oracle
app.post('/chat', async (c) => {
  try {
    // RX: Leemos el JSON que nos manda el frontend
    const body = await c.req.json()
    const { query, snapshot, mcu_id } = body

    // El cerebro de OmniEdge procesando la solicitud
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `Eres el OmniEdge Oracle, un experto en ingeniería electrónica y sistemas embebidos. 
               Estás analizando un sistema basado en el MCU: ${mcu_id || 'STM32 (Default)'}. 
               Tu objetivo es ayudar a Marcos a validar su hardware. 
               Responde siempre de forma técnica, precisa y concisa.`,
      prompt: query || 'Hola Oracle',
    })

    // TX: Enviamos la respuesta de la IA de vuelta al chat
    return c.json({ message: text })
    
  } catch (error) {
    console.error('❌ Error en el Oracle:', error)
    return c.json({ 
      message: "Error de comunicación con el núcleo de IA. Revisa la consola del servidor." 
    }, 500)
  }
})
// Si estamos corriendo en tu PC (y no en Vercel), encendemos el servidor local
if (process.env.NODE_ENV !== 'production') {
  serve({
    fetch: app.fetch,
    port: 3001
  }, (info) => {
    console.log(`🚀 Oracle Core encendido en http://localhost:${info.port}`)
  })
}
// 4. Exportación para Vercel Edge Runtime
export const runtime = 'edge'
export default handle(app)