import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function PUT(
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
    const { tasks } = body

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Formato inválido' },
        { status: 400 }
      )
    }

    // Atualiza a ordem das tarefas em batch
    const batch = db.batch()

    for (const task of tasks) {
      const taskRef = db.collection('tasks').doc(task.id)
      batch.update(taskRef, { order: task.order, updatedAt: new Date().toISOString() })
    }

    await batch.commit()

    return NextResponse.json({ message: 'Tarefas reordenadas com sucesso' })
  } catch (error) {
    console.error('Erro ao reordenar tarefas:', error)
    return NextResponse.json(
      { error: 'Erro ao reordenar tarefas' },
      { status: 500 }
    )
  }
}