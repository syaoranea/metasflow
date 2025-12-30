// lib/db.ts
import { firebaseAdmin } from '@/lib/firebaseAdmin'

// Funções auxiliares para facilitar o uso do Firestore
export const db = firebaseAdmin.firestore()
export const storage = firebaseAdmin.storage()
