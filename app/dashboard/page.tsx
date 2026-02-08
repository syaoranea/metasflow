"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { GoalCard } from '@/components/goal-card'
import { StatsCard } from '@/components/stats-card'
import { FilterBar } from '@/components/filter-bar'
import { ProgressChart } from '@/components/charts/progress-chart'
import { YearSelector } from '@/components/year-selector'
import { Target, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'

// Tipos atualizados para funcionar com Firestore
interface Task {
  id: string
  title: string
  completed: boolean
  order: number
  deadline?: string
  goalId: string
  createdAt: string
  updatedAt: string
}

interface Reflection {
  id: string
  whatWorked?: string
  whatDidntWork?: string
  goalId: string
  createdAt: string
  updatedAt: string
}

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  deadline?: string
  priority: string
  status: string
  userId: string
  createdAt: string
  updatedAt: string
  tasks?: Task[]
  reflections?: Reflection[]
}

type GoalWithTasks = Goal & {
  tasks: { completed: boolean }[]
}

// Componente de Skeleton para os StatsCard
function StatsCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="p-6 rounded-xl border bg-card shadow-sm space-y-3"
      style={{ 
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        animationDelay: `${index * 0.1}s` 
      }}
    >
      <div className="flex justify-between items-start">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
      </div>
      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      <div className="h-3 w-32 bg-muted rounded animate-pulse" />
    </div>
  )
}

// Função para obter o ano atual dinamicamente
function getCurrentYear(): number {
  return new Date().getFullYear()
}

export default function DashboardPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [goals, setGoals] = useState<GoalWithTasks[]>([])
  const [categoryFilter, setCategoryFilter] = useState('TODAS')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
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
  }, [status, categoryFilter, statusFilter, selectedYear])

  const fetchGoals = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'TODAS') params.append('category', categoryFilter)
      if (statusFilter !== 'TODOS') params.append('status', statusFilter)
      // Sempre enviar o ano selecionado para filtrar
      params.append('year', selectedYear.toString())

      const response = await fetch(`/api/goals?${params.toString()}`)
      if (response.ok) {
        const data: GoalWithTasks[] = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Erro ao buscar metas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para remover a meta do estado local após exclusão
  const handleGoalDeleted = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId))
  }

  // Handler para mudança de ano
  const handleYearChange = (year: number) => {
    setSelectedYear(year)
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

  // Estatísticas baseadas apenas nas metas do ano selecionado (já filtradas pela API)
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

  // Total de metas do ano selecionado (já filtradas pela API)
  const totalGoalsForYear = goals.length

  // Dados mensais para o gráfico - Progresso ACUMULADO ao longo do ano
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  
  const monthlyData = monthNames.map((monthName, monthIndex) => {
    // Calcular a data do final do mês
    const endOfMonth = new Date(selectedYear, monthIndex + 1, 0, 23, 59, 59, 999)
    
    // Contar metas concluídas ATÉ o final deste mês (acumulado)
    const completedUntilMonth = goals.filter((goal) => {
      if (goal.status !== 'CONCLUIDA') return false
      
      // Usar updatedAt como data de conclusão (quando a meta foi marcada como concluída)
      const completionDate = new Date(goal.updatedAt)
      return completionDate <= endOfMonth
    }).length
    
    return {
      month: monthName,
      completed: completedUntilMonth,
      total: totalGoalsForYear
    }
  })

  const currentYear = getCurrentYear()
  const isCurrentYear = selectedYear === currentYear

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header com título dinâmico e seletor de ano */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Minhas Metas {selectedYear}
                {!isCurrentYear && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (Histórico)
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isCurrentYear 
                  ? 'Acompanhe o progresso das suas metas e mantenha o foco nos seus objetivos.'
                  : `Visualizando dados históricos de ${selectedYear}.`
                }
              </p>
            </div>
            <YearSelector 
              selectedYear={selectedYear} 
              onYearChange={handleYearChange} 
            />
          </div>

          {/* Stats Cards com Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <StatsCardSkeleton index={0} />
                <StatsCardSkeleton index={1} />
                <StatsCardSkeleton index={2} />
                <StatsCardSkeleton index={3} />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Progress Chart com Loading */}
          {isLoading ? (
            <div className="w-full h-64 rounded-xl bg-muted/60 animate-pulse" />
          ) : (
            <ProgressChart data={monthlyData} year={selectedYear} />
          )}

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
                  {isCurrentYear 
                    ? `Crie sua primeira meta e comece a organizar ${selectedYear}!`
                    : `Não há metas registradas para ${selectedYear}.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal, idx) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    index={idx}
                    onDeleted={handleGoalDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
