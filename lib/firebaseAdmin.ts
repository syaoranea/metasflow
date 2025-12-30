// lib/firebaseAdmin.ts
import admin from 'firebase-admin'

function getPrivateKeyFromEnv(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY || ''

  // Remove aspas no início/fim se existirem
  const withoutQuotes = raw.replace(/^"(.*)"$/s, '$1').replace(/^'(.*)'$/s, '$1')

  // Se já contém o header PEM com quebras reais, use direto
  if (withoutQuotes.includes('-----BEGIN PRIVATE KEY-----')) {
    return withoutQuotes
  }

  // Caso contrário, converte as sequências literais \n em quebras de linha reais
  return withoutQuotes.replace(/\\n/g, '\n')
}

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = getPrivateKeyFromEnv()

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase env vars. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set.'
    )
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    } as any),
  })
}

// Exportações corretas
export const firebaseAdmin = admin
export const db = admin.firestore()
export const auth = admin.auth() 
export const storage = admin.storage()