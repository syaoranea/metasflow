// app/api/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/firebaseAdmin'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 },
      )
    }

    // Verificar se já existe usuário com esse email
    const existing = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (!existing.empty) {
      return NextResponse.json(
        { error: 'Já existe um usuário com esse email' },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.collection('users').add({
      email,
      name: name || '',
      password: hashedPassword,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno ao registrar usuário' },
      { status: 500 },
    )
  }
}