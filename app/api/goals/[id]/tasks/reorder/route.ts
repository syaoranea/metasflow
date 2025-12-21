import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { tasks } = body

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Formato inválido' },
        { status: 400 }
      )
    }

    await Promise.all(
      tasks.map((task: { id: string; order: number }) =>
        prisma.task.update({
          where: { id: task.id },
          data: { order: task.order },
        })
      )
    )

    return NextResponse.json({ message: 'Tarefas reordenadas com sucesso' })
  } catch (error) {
    console.error('Erro ao reordenar tarefas:', error)
    return NextResponse.json(
      { error: 'Erro ao reordenar tarefas' },
      { status: 500 }
    )
  }
}
