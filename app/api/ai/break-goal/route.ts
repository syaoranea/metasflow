import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { goalTitle, goalDescription } = body

    if (!goalTitle) {
      return NextResponse.json(
        { error: 'Título da meta é obrigatório' },
        { status: 400 }
      )
    }

    const prompt = `Você é um especialista em planejamento e produtividade. Quebre a seguinte meta em 5-8 tarefas acionáveis e específicas:

Meta: ${goalTitle}
${goalDescription ? `Descrição: ${goalDescription}` : ''}

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem blocos de código, apenas JSON puro):
{
  "tasks": [
    {
      "title": "Título da tarefa 1",
      "estimatedDays": 7
    },
    {
      "title": "Título da tarefa 2",
      "estimatedDays": 14
    }
  ]
}

As tarefas devem ser:
- Específicas e acionáveis
- Ordenadas logicamente (do primeiro ao último passo)
- Com estimativa de dias realista para conclusão
- Entre 5 e 8 tarefas no total`

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        stream: true,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro na API de IA')
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ''
        let partialRead = ''

        try {
          while (true) {
            const { done, value } = await reader!.read()
            if (done) break

            partialRead += decoder.decode(value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines.pop() ?? ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer)
                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: finalResult,
                    })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  } catch (e) {
                    console.error('Erro ao parsear JSON:', e)
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ status: 'error', message: 'Erro ao processar resposta' })}\n\n`
                      )
                    )
                  }
                  return
                }
                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed?.choices?.[0]?.delta?.content ?? ''
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Gerando tarefas...',
                  })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Erro ao quebrar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
