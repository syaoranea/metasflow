import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const where: any = {
      userId: session.user.id,
    }

    if (category && category !== 'TODAS') {
      where.category = category
    }

    if (status && status !== 'TODOS') {
      where.status = status
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        tasks: true,
        reflections: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

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

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        category,
        deadline: deadline ? new Date(deadline) : null,
        priority,
        userId: session.user.id,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar meta' },
      { status: 500 }
    )
  }
}
