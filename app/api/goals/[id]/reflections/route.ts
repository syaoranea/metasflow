import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const goal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const reflections = await prisma.reflection.findMany({
      where: {
        goalId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reflections)
  } catch (error) {
    console.error('Erro ao buscar reflexões:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar reflexões' },
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
    const { whatWorked, whatDidntWork } = body

    const reflection = await prisma.reflection.create({
      data: {
        whatWorked,
        whatDidntWork,
        goalId: params.id,
      },
    })

    return NextResponse.json(reflection, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar reflexão:', error)
    return NextResponse.json(
      { error: 'Erro ao criar reflexão' },
      { status: 500 }
    )
  }
}
