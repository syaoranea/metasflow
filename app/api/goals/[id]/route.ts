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
      include: {
        tasks: {
          orderBy: {
            order: 'asc',
          },
        },
        reflections: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar meta' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, deadline, priority, status } = body

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const goal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        deadline: deadline ? new Date(deadline) : null,
        priority,
        status,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Erro ao atualizar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar meta' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    await prisma.goal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Meta excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar meta' },
      { status: 500 }
    )
  }
}
