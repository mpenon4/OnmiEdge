import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })), 
      system: `Eres el Oracle de OmniEdge. 
      Responde como un ingeniero senior de la UTN Paraná. 
      Experto en STM32, Proteus y TinyML. 
      Sé ultra breve y técnico.`,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("🔥 Error en el Oracle:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}