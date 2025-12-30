// app/api/ai/break-goal/route.ts
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

    // Verificar se a chave da Perplexity está configurada
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY não está configurada')
      return NextResponse.json(
        { error: 'Serviço de IA não configurado' },
        { status: 500 }
      )
    }

    // 🔧 MODELOS VALIDADOS PARA PERPLEXITY API (Dez/2025)
    const VALID_MODELS = [
      'sonar-pro',
      'sonar',
      'sonar-reasoning-pro', 
      'sonar-reasoning',
      'llama-3.1-sonar-large-128k-online', // Legacy mas ainda funciona
      'llama-3.1-sonar-large-128k'        // Legacy offline
    ]

    // Primeiro, tentar endpoint de modelos (com timeout e melhor parsing)
    let availableModels: string[] = []
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

      const modelsResponse = await fetch('https://api.perplexity.ai/models', {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        console.log('Resposta completa da lista de modelos:', JSON.stringify(modelsData, null, 2))
        
        // 🔧 Melhor parsing da resposta de modelos
        if (Array.isArray(modelsData)) {
          availableModels = modelsData
            .map((m: any) => typeof m === 'string' ? m : m.id || m.name || m.model)
            .filter(Boolean) as string[]
        } else if (modelsData?.data?.length) {
          availableModels = modelsData.data
            .map((m: any) => m.id || m.name || m.model)
            .filter(Boolean) as string[]
        }
      }
    } catch (error) {
      console.warn('Erro ao obter lista de modelos (usando fallback):', error)
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
    }
  ]
}

IMPORTANTE: 
- 5-8 tarefas específicas e acionáveis
- Ordem lógica (primeiro → último passo)
- Estimativa de dias realista
- Apenas JSON válido, nada mais`

    // 🔧 Priorizar modelos conhecidos + disponíveis
    const modelsToTry = [
      ...VALID_MODELS.filter(model => availableModels.includes(model)),
      ...VALID_MODELS,
      ...availableModels.slice(0, 3) // Primeiros 3 modelos da API
    ].filter((model, index, arr) => arr.indexOf(model) === index) // Remover duplicatas

    console.log('Modelos para tentar:', modelsToTry)

    if (modelsToTry.length === 0) {
      throw new Error('Nenhum modelo disponível para usar')
    }

    let response: Response | null = null
    let successfulModel = ''
    let lastError = ''

    // Tentar cada modelo até encontrar um que funcione
    for (const model of modelsToTry) {
      try {
        console.log(`Tentando modelo: ${model}`)
        
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'Responda SEMPRE em português brasileiro e forneça APENAS JSON válido, sem explicações, markdown ou texto adicional.'
              },
              {
                role: 'user',
                content: prompt,
              }
            ],
            temperature: 0.3, // 🔧 Menos aleatoriedade para JSON consistente
            max_tokens: 1500,
            stream: false
          }),
        })

        if (response.ok) {
          successfulModel = model
          console.log(`✅ Modelo ${model} funcionou!`)
          break
        } else {
          const errorText = await response.text()
          console.warn(`❌ Modelo ${model} falhou (${response.status}):`, errorText)
          lastError = `Modelo ${model}: ${response.status} ${errorText}`
        }
      } catch (error: any) {
        console.warn(`❌ Erro com modelo ${model}:`, error.message)
        lastError = `Modelo ${model}: ${error.message}`
      }
    }

    if (!response?.ok) {
      console.error('Todos os modelos falharam. Último erro:', lastError)
      console.error('Modelos tentados:', modelsToTry)
      throw new Error(`Nenhum modelo válido encontrado. Último erro: ${lastError}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Resposta inválida da API do Perplexity')
    }

    // 🔧 Melhor parsing de JSON
    let parsedResult
    try {
      // Tentar parse direto
      parsedResult = JSON.parse(content.trim())
    } catch (parseError) {
      try {
        // Extrair JSON de markdown/texto
        const jsonMatch = content.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0])
        } else {
          throw parseError
        }
      } catch {
        console.error('Conteúdo bruto da resposta:', content)
        throw new Error('Não foi possível extrair JSON válido')
      }
    }

    // Validar estrutura mínima
    if (!parsedResult.tasks || !Array.isArray(parsedResult.tasks)) {
      throw new Error('Resposta não contém array de tasks válido')
    }

    console.log(`✅ Sucesso com modelo: ${successfulModel}`)
    console.log('Tarefas geradas:', parsedResult.tasks.length)

    return NextResponse.json({
      status: 'completed',
      modelUsed: successfulModel,
      result: parsedResult
    })

  } catch (error: any) {
    console.error('Erro ao quebrar meta:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar requisição',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
