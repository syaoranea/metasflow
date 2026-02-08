// pages/api/goals/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const year = searchParams.get('year')

    let query: FirebaseFirestore.Query = db.collection('goals')

    // Filtrar por userId
    query = query.where('userId', '==', session.user.id)

    // Filtrar por categoria
    if (category && category !== 'TODAS') {
      query = query.where('category', '==', category)
    }

    // Filtrar por status
    if (status && status !== 'TODOS') {
      query = query.where('status', '==', status)
    }

    // Ordenar por data de criação (descendente)
    const snapshot = await query.orderBy('createdAt', 'desc').get()

    const goals = []
    
    // Determinar o ano para filtro (padrão: ano atual)
    const filterYear = year ? parseInt(year) : new Date().getFullYear()
    const yearStart = new Date(filterYear, 0, 1) // 1 de janeiro do ano
    const yearEnd = new Date(filterYear, 11, 31, 23, 59, 59, 999) // 31 de dezembro do ano
    
    for (const doc of snapshot.docs) {
      const goalData = doc.data()
      const goal = { id: doc.id, ...goalData }

      // Filtrar por ano baseado no deadline
      if (goalData.deadline) {
        const deadlineDate = new Date(goalData.deadline)
        // Incluir apenas metas com deadline no ano especificado
        if (deadlineDate < yearStart || deadlineDate > yearEnd) {
          continue // Pular metas fora do ano filtrado
        }
      } else {
        // Se não tem deadline, usar a data de criação para filtrar
        if (goalData.createdAt) {
          const createdDate = new Date(goalData.createdAt)
          if (createdDate < yearStart || createdDate > yearEnd) {
            continue // Pular metas criadas fora do ano filtrado
          }
        }
      }

      // Buscar tasks relacionadas
      const tasksSnapshot = await db
        .collection('tasks')
        .where('goalId', '==', doc.id)
        .get()
      const tasks = tasksSnapshot.docs.map(t => ({ id: t.id, ...t.data() }))

      // Buscar reflections relacionadas
      const reflectionsSnapshot = await db
        .collection('reflections')
        .where('goalId', '==', doc.id)
        .get()
      const reflections = reflectionsSnapshot.docs.map(r => ({
        id: r.id,
        ...r.data(),
      }))

      goals.push({
        ...goal,
        tasks,
        reflections,
      })
    }

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar metas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, deadline, priority } = body

    if (!title || !category || !priority) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const newGoal = {
      title,
      description: description || '',
      category,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority,
      status: 'EM_ANDAMENTO',
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await db.collection('goals').add(newGoal)
    const goal = { id: docRef.id, ...newGoal }

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar meta' },
      { status: 500 }
    )
  }
}
