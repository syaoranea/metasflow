"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { GoalCard } from '@/components/goal-card'
import { StatsCard } from '@/components/stats-card'
import { FilterBar } from '@/components/filter-bar'
import { ProgressChart } from '@/components/charts/progress-chart'
import { Target, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { Goal } from '@prisma/client'

type GoalWithTasks = Goal & {
  tasks: { completed: boolean }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [goals, setGoals] = useState<GoalWithTasks[]>([])
  const [categoryFilter, setCategoryFilter] = useState('TODAS')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGoals()
    }
  }, [status, categoryFilter, statusFilter])

  const fetchGoals = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'TODAS') params.append('category', categoryFilter)
      if (statusFilter !== 'TODOS') params.append('status', statusFilter)

      const response = await fetch(`/api/goals?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Erro ao buscar metas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.status === 'CONCLUIDA').length
  const overdueGoals = goals.filter(
    (g) => g.deadline && new Date(g.deadline) < new Date() && g.status !== 'CONCLUIDA'
  ).length

  const totalTasks = goals.reduce((acc, g) => acc + (g.tasks?.length ?? 0), 0)
  const completedTasks = goals.reduce(
    (acc, g) => acc + (g.tasks?.filter((t) => t.completed).length ?? 0),
    0
  )
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const monthlyData = [
    { month: 'Jan', completed: 0, total: 0 },
    { month: 'Fev', completed: 0, total: 0 },
    { month: 'Mar', completed: 0, total: 0 },
    { month: 'Abr', completed: 0, total: 0 },
    { month: 'Mai', completed: 0, total: 0 },
    { month: 'Jun', completed: 0, total: 0 },
    { month: 'Jul', completed: 0, total: 0 },
    { month: 'Ago', completed: 0, total: 0 },
    { month: 'Set', completed: 0, total: 0 },
    { month: 'Out', completed: 0, total: 0 },
    { month: 'Nov', completed: 0, total: 0 },
    { month: 'Dez', completed: 1, total: 1 },
  ]

  goals.forEach((goal) => {
    if (goal.deadline) {
      const month = new Date(goal.deadline).getMonth()
      monthlyData[month].total += 1
      if (goal.status === 'CONCLUIDA') {
        monthlyData[month].completed += 1
      }
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Minhas Metas 2025</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe o progresso das suas metas e mantenha o foco nos seus objetivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total de Metas"
              value={totalGoals}
              icon={Target}
              color="text-blue-600 dark:text-blue-400"
              index={0}
            />
            <StatsCard
              title="Metas Concluídas"
              value={completedGoals}
              icon={CheckCircle2}
              description={`${totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% do total`}
              color="text-green-600 dark:text-green-400"
              index={1}
            />
            <StatsCard
              title="Metas Atrasadas"
              value={overdueGoals}
              icon={AlertCircle}
              color="text-red-600 dark:text-red-400"
              index={2}
            />
            <StatsCard
              title="Progresso Geral"
              value={overallProgress}
              icon={TrendingUp}
              description="% de tarefas concluídas"
              color="text-purple-600 dark:text-purple-400"
              index={3}
            />
          </div>

          <ProgressChart data={monthlyData} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Suas Metas</h2>
            </div>

            <FilterBar
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              onCategoryChange={setCategoryFilter}
              onStatusChange={setStatusFilter}
              onClear={() => {
                setCategoryFilter('TODAS')
                setStatusFilter('TODOS')
              }}
            />

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando metas...</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhuma meta encontrada</p>
                <p className="text-muted-foreground mt-2">
                  Crie sua primeira meta e comece a organizar 2025!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal, idx) => (
                  <GoalCard key={goal.id} goal={goal} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
