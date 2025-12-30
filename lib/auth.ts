// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { FirestoreAdapter } from '@next-auth/firebase-adapter'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/firebaseAdmin'

type AppUser = {
  id: string
  email: string
  name?: string
  password?: string // senha hasheada com bcrypt
}

// Busca usuário na coleção "users" do Firestore
async function getUserByEmail(email: string): Promise<AppUser | null> {
  try {
    const userQuery = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (userQuery.empty) {
      return null
    }

    const userDoc = userQuery.docs[0]
    const data = userDoc.data() as {
      email: string
      name?: string
      password?: string
    }

    return {
      id: userDoc.id,
      email: data.email,
      name: data.name,
      password: data.password,
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  // Usa o Firestore como adapter do NextAuth
  adapter: FirestoreAdapter(db as any),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email)

        // Se não existe usuário ou não tem senha salva, falha
        if (!user || !user.password) {
          return null
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        )

        if (!isCorrectPassword) {
          return null
        }

        // Retorno mínimo exigido pelo NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      }
    },
  },
}