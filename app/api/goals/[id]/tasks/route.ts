import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const tasks = await prisma.task.findMany({
      where: {
        goalId: params.id,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tarefas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
    const { title, deadline } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    const maxOrder = await prisma.task.findFirst({
      where: { goalId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const task = await prisma.task.create({
      data: {
        title,
        deadline: deadline ? new Date(deadline) : null,
        order: (maxOrder?.order ?? -1) + 1,
        goalId: params.id,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    )
  }
}
