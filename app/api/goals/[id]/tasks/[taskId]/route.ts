import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const goal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { completed, title, deadline } = body

    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: {
        ...(completed !== undefined && { completed }),
        ...(title && { title }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
    })

    return NextResponse.json(task)
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

    const goal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.taskId },
    })

    return NextResponse.json({ message: 'Tarefa excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar tarefa' },
      { status: 500 }
    )
  }
}
