import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
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
    const { completed, title, deadline } = body

    const taskRef = db.collection('tasks').doc(params.taskId)
    const taskDoc = await taskRef.get()

    if (!taskDoc.exists) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    const updateData: any = {}
    if (completed !== undefined) updateData.completed = completed
    if (title) updateData.title = title
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline).toISOString() : null
    updateData.updatedAt = new Date().toISOString()

    await taskRef.update(updateData)

    const updatedTaskDoc = await taskRef.get()
    return NextResponse.json({ id: updatedTaskDoc.id, ...updatedTaskDoc.data() })
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
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

    const taskRef = db.collection('tasks').doc(params.taskId)
    const taskDoc = await taskRef.get()

    if (!taskDoc.exists) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    await taskRef.delete()

    return NextResponse.json({ message: 'Tarefa excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar tarefa' },
      { status: 500 }
    )
  }
}