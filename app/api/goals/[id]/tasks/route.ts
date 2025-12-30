import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verifica se a meta pertence ao usuário
    const goalDoc = await db.collection('goals').doc(params.id).get()
    if (!goalDoc.exists) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }
    const goalData = goalDoc.data()
    if (goalData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Busca tarefas relacionadas ordenadas por 'order' asc
    const tasksSnapshot = await db
      .collection('tasks')
      .where('goalId', '==', params.id)
      .orderBy('order', 'asc')
      .get()

    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tarefas' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verifica se a meta pertence ao usuário
    const goalDoc = await db.collection('goals').doc(params.id).get()
    if (!goalDoc.exists) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }
    const goalData = goalDoc.data()
    if (goalData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, deadline } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a maior ordem atual para a meta
    const tasksSnapshot = await db
      .collection('tasks')
      .where('goalId', '==', params.id)
      .orderBy('order', 'desc')
      .limit(1)
      .get()

    const maxOrder = tasksSnapshot.empty ? -1 : tasksSnapshot.docs[0].data().order

    const newTask = {
      title,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      order: maxOrder + 1,
      goalId: params.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await db.collection('tasks').add(newTask)

    return NextResponse.json({ id: docRef.id, ...newTask }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    )
  }
}