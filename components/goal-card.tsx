"use client"

import { Goal } from '@prisma/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Target, Calendar, AlertCircle, CheckCircle2, Pause } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'

interface GoalCardProps {
  goal: Goal & {
    tasks?: { completed: boolean }[]
  }
  index?: number
}

const categoryColors: Record<string, string> = {
  PESSOAL: 'bg-purple-200 text-purple-900 dark:bg-purple-900/70 dark:text-purple-200 border-purple-300 dark:border-purple-700',
  CARREIRA: 'bg-blue-200 text-blue-900 dark:bg-blue-900/70 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  SAUDE: 'bg-green-200 text-green-900 dark:bg-green-900/70 dark:text-green-200 border-green-300 dark:border-green-700',
  FINANCAS: 'bg-amber-200 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  ESTUDOS: 'bg-orange-200 text-orange-900 dark:bg-orange-900/70 dark:text-orange-200 border-orange-300 dark:border-orange-700',
  RELACIONAMENTOS: 'bg-pink-200 text-pink-900 dark:bg-pink-900/70 dark:text-pink-200 border-pink-300 dark:border-pink-700',
  LAZER: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900/70 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
  ESPIRITUALIDADE: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900/70 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
  IMPACTO_SOCIAL: 'bg-teal-200 text-teal-900 dark:bg-teal-900/70 dark:text-teal-200 border-teal-300 dark:border-teal-700',
  BENS_DE_CONSUMO: 'bg-rose-200 text-rose-900 dark:bg-rose-900/70 dark:text-rose-200 border-rose-300 dark:border-rose-700',
}

const priorityColors: Record<string, string> = {
  ALTA: 'bg-red-200 text-red-900 dark:bg-red-900/70 dark:text-red-200 border-red-300 dark:border-red-700',
  MEDIA: 'bg-amber-200 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  BAIXA: 'bg-green-200 text-green-900 dark:bg-green-900/70 dark:text-green-200 border-green-300 dark:border-green-700',
}

const statusConfig = {
  EM_ANDAMENTO: { icon: Target, label: 'Em Andamento', color: 'text-blue-600 dark:text-blue-400' },
  CONCLUIDA: { icon: CheckCircle2, label: 'Concluída', color: 'text-green-600 dark:text-green-400' },
  PAUSADA: { icon: Pause, label: 'Pausada', color: 'text-gray-600 dark:text-gray-400' },
}

export function GoalCard({ goal, index = 0 }: GoalCardProps) {
  const progress = goal.tasks && goal.tasks.length > 0
    ? (goal.tasks.filter((t) => t.completed).length / goal.tasks.length) * 100
    : 0

  const StatusIcon = statusConfig[goal.status]?.icon ?? Target
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'CONCLUIDA'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link href={`/goals/${goal.id}`}>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg flex-1">{goal.title}</CardTitle>
              <StatusIcon className={`h-5 w-5 ${statusConfig[goal.status]?.color ?? ''}`} />
            </div>
            {goal.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {goal.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={categoryColors[goal.category] ?? ''}>
                {goal.category}
              </Badge>
              <Badge className={priorityColors[goal.priority] ?? ''}>
                {goal.priority}
              </Badge>
              {goal.deadline && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(goal.deadline), "dd 'de' MMM", { locale: ptBR })}
                </Badge>
              )}
            </div>

            {isOverdue && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Atrasada</span>
              </div>
            )}

            {goal.tasks && goal.tasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Progresso</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-gray-600 dark:text-gray-400">
            {statusConfig[goal.status]?.label ?? ''}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}