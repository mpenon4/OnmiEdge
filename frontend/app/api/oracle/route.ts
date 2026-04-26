import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const app = new Hono().basePath('/api')

// Endpoint de salud
app.get('/health', (c) => c.json({ status: 'Operacional', platform: 'OmniEdge Next' }))

// Endpoint del Oracle
app.post('/chat', async (c) => {
  try {
    const { query, snapshot, mcu_id } = await c.req.json()

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `Eres el OmniEdge Oracle, un experto en ingeniería electrónica y sistemas embebidos. 
               Estás analizando un sistema basado en el MCU: ${mcu_id || 'STM32'}. 
               Responde siempre de forma técnica, precisa y concisa.`,
      prompt: query || 'Hola Oracle',
    })

    return c.json({ message: text })
  } catch (error) {
    console.error('❌ Error Oracle:', error)
    return c.json({ message: "Error interno del Oracle." }, 500)
  }
})

// Magia pura: Next.js le pasa el control a Hono
export const GET = handle(app)
export const POST = handle(app)