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

    const goalDoc = await db.collection('goals').doc(params.id).get()

    if (!goalDoc.exists) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const goalData = goalDoc.data()

    if (goalData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar tasks relacionadas ordenadas por 'order' asc
    const tasksSnapshot = await db
      .collection('tasks')
      .where('goalId', '==', params.id)
      .orderBy('order', 'asc')
      .get()
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Buscar reflections relacionadas ordenadas por 'createdAt' desc
    const reflectionsSnapshot = await db
      .collection('reflections')
      .where('goalId', '==', params.id)
      .orderBy('createdAt', 'desc')
      .get()
    const reflections = reflectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ id: goalDoc.id, ...goalData, tasks, reflections })
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
    return NextResponse.json({ error: 'Erro ao buscar meta' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, deadline, priority, status } = body

    const goalRef = db.collection('goals').doc(params.id)
    const goalDoc = await goalRef.get()

    if (!goalDoc.exists) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const goalData = goalDoc.data()
    if (goalData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const updatedData: any = {
      title,
      description,
      category,
      priority,
      status,
      updatedAt: new Date().toISOString(),
    }

    if (deadline) {
      updatedData.deadline = new Date(deadline).toISOString()
    } else {
      updatedData.deadline = null
    }

    await goalRef.update(updatedData)

    const updatedGoalDoc = await goalRef.get()
    return NextResponse.json({ id: updatedGoalDoc.id, ...updatedGoalDoc.data() })
  } catch (error) {
    console.error('Erro ao atualizar meta:', error)
    return NextResponse.json({ error: 'Erro ao atualizar meta' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const goalRef = db.collection('goals').doc(params.id)
    const goalDoc = await goalRef.get()

    if (!goalDoc.exists) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const goalData = goalDoc.data()
    if (goalData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await goalRef.delete()

    return NextResponse.json({ message: 'Meta excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar meta:', error)
    return NextResponse.json({ error: 'Erro ao deletar meta' }, { status: 500 })
  }
}