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

    // Busca reflexões relacionadas ordenadas por createdAt desc
    const reflectionsSnapshot = await db
      .collection('reflections')
      .where('goalId', '==', params.id)
      .orderBy('createdAt', 'desc')
      .get()

    const reflections = reflectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

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
    const { whatWorked, whatDidntWork } = body

    const newReflection = {
      whatWorked,
      whatDidntWork,
      goalId: params.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await db.collection('reflections').add(newReflection)

    return NextResponse.json({ id: docRef.id, ...newReflection }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar reflexão:', error)
    return NextResponse.json(
      { error: 'Erro ao criar reflexão' },
      { status: 500 }
    )
  }
}