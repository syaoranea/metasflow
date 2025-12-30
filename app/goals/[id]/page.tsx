"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/navbar'
import { TaskList } from '@/components/task-list'
import { ReflectionForm } from '@/components/reflection-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Edit2,
  Trash2,
  Calendar,
  Target,
  Lightbulb,
  AlertTriangle,
  Plus,
  ChevronLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

type GoalWithRelations = Goal & {
  tasks: Task[]
  reflections: Reflection[]
}

const categoryColors: Record<string, string> = {
  PESSOAL:
    'bg-purple-200 text-purple-900 dark:bg-purple-900/70 dark:text-purple-200 border-purple-300 dark:border-purple-700',
  CARREIRA:
    'bg-blue-200 text-blue-900 dark:bg-blue-900/70 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  SAUDE:
    'bg-green-200 text-green-900 dark:bg-green-900/70 dark:text-green-200 border-green-300 dark:border-green-700',
  FINANCAS:
    'bg-amber-200 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  ESTUDOS:
    'bg-orange-200 text-orange-900 dark:bg-orange-900/70 dark:text-orange-200 border-orange-300 dark:border-orange-700',
}

const priorityColors: Record<string, string> = {
  ALTA:
    'bg-red-200 text-red-900 dark:bg-red-900/70 dark:text-red-200 border-red-300 dark:border-red-700',
  MEDIA:
    'bg-amber-200 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  BAIXA:
    'bg-green-200 text-green-900 dark:bg-green-900/70 dark:text-green-200 border-green-300 dark:border-green-700',
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { status } = useSession() || {}
  const [goal, setGoal] = useState<GoalWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDeadline, setNewTaskDeadline] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [currentStatus, setCurrentStatus] = useState('')

  // Modal de exclusão de meta
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔴 Estados para EDITAR TAREFA
  const [openEditTaskModal, setOpenEditTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDeadline, setEditTaskDeadline] = useState('')
  const [isSavingTask, setIsSavingTask] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    } else if (status === 'authenticated') {
      fetchGoal()
    }
  }, [status])

  const fetchGoal = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/goals/${params?.id}`)
      if (response.ok) {
        const data: GoalWithRelations = await response.json()
        setGoal(data)
        setCurrentStatus(data.status)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao buscar meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle) return

    setIsAddingTask(true)
    try {
      const response = await fetch(`/api/goals/${params?.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          deadline: newTaskDeadline || null,
        }),
      })

      if (response.ok) {
        setNewTaskTitle('')
        setNewTaskDeadline('')
        fetchGoal()
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    } finally {
      setIsAddingTask(false)
    }
  }

  const handleDeleteGoal = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/goals/${params?.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        console.error('Erro ao deletar meta:', await response.text())
      }
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
    } finally {
      setIsDeleting(false)
      setOpenDeleteModal(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/goals/${params?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: goal?.title,
          description: goal?.description,
          category: goal?.category,
          priority: goal?.priority,
          deadline: goal?.deadline,
          status: newStatus,
        }),
      })

      if (response.ok) {
        setCurrentStatus(newStatus)
        fetchGoal()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  // 🔴 Abrir modal de edição de tarefa
  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task)
    setEditTaskTitle(task.title)
    setEditTaskDeadline(task.deadline ? task.deadline.slice(0, 10) : '')
    setOpenEditTaskModal(true)
  }

  // 🔴 Salvar tarefa editada
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !editTaskTitle) return

    setIsSavingTask(true)
    try {
      const response = await fetch(
        `/api/goals/${params?.id}/tasks/${editingTask.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editTaskTitle,
            deadline: editTaskDeadline || null,
            completed: editingTask.completed,
            order: editingTask.order,
          }),
        }
      )

      if (response.ok) {
        setOpenEditTaskModal(false)
        setEditingTask(null)
        await fetchGoal()
      } else {
        console.error('Erro ao atualizar tarefa:', await response.text())
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    } finally {
      setIsSavingTask(false)
    }
  }

  if (isLoading || !goal) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  const progress =
    goal.tasks?.length > 0
      ? (goal.tasks.filter((t) => t.completed).length / goal.tasks.length) * 100
      : 0

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Navbar />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            {/* Card da meta */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-6 w-6 text-primary" />
                      <CardTitle className="text-3xl">{goal.title}</CardTitle>
                    </div>
                    {goal.description && (
                      <p className="text-muted-foreground mt-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/goals/${goal.id}/edit`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setOpenDeleteModal(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className={categoryColors[goal.category] ?? ''}>
                    {goal.category}
                  </Badge>
                  <Badge className={priorityColors[goal.priority] ?? ''}>
                    Prioridade {goal.priority}
                  </Badge>
                  {goal.deadline && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-3 w-3" />
                      {format(
                        new Date(goal.deadline),
                        "dd 'de' MMMM 'de' yyyy",
                        {
                          locale: ptBR,
                        }
                      )}
                    </Badge>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-bold">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full md:w-[250px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                      <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                      <SelectItem value="PAUSADA">Pausada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Card de Tarefas */}
            <Card>
              <CardHeader>
                <CardTitle>Tarefas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Adicionar nova tarefa..."
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-[150px]"
                  />
                  <Button type="submit" disabled={isAddingTask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>

                <TaskList
                  tasks={goal.tasks ?? []}
                  goalId={goal.id}
                  onUpdate={fetchGoal}
                  // 🔴 callback para abrir modal de edição
                  onEditTask={handleOpenEditTask}
                />
              </CardContent>
            </Card>

            {/* Reflexões */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReflectionForm goalId={goal.id} onSuccess={fetchGoal} />

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Reflexões</CardTitle>
                </CardHeader>
                <CardContent>
                  {goal.reflections?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma reflexão ainda. Comece a registrar seus aprendizados!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {goal.reflections?.map((reflection) => (
                        <div
                          key={reflection.id}
                          className="p-4 bg-muted/50 rounded-lg space-y-3"
                        >
                          <div className="text-xs text-muted-foreground">
                            {format(
                              new Date(reflection.createdAt),
                              "dd/MM/yyyy 'às' HH:mm",
                              {
                                locale: ptBR,
                              }
                            )}
                          </div>
                          {reflection.whatWorked && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                <Lightbulb className="h-4 w-4" />
                                O que funcionou
                              </div>
                              <p className="text-sm">
                                {reflection.whatWorked}
                              </p>
                            </div>
                          )}
                          {reflection.whatDidntWork && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                                <AlertTriangle className="h-4 w-4" />
                                O que não funcionou
                              </div>
                              <p className="text-sm">
                                {reflection.whatDidntWork}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Botão Voltar */}
            <div className="flex justify-end mt-8">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar para o Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de confirmação de exclusão da meta */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir meta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a meta <strong>{goal.title}</strong>?
              <br />
              Essa ação não pode ser desfeita e também removerá todas as tarefas e reflexões relacionadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGoal}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔴 Modal de EDIÇÃO de tarefa */}
      <Dialog open={openEditTaskModal} onOpenChange={setOpenEditTaskModal}>
        <DialogContent>
          <form onSubmit={handleSaveTask}>
            <DialogHeader>
              <DialogTitle>Editar tarefa</DialogTitle>
              <DialogDescription>
                Ajuste o título e o prazo da tarefa selecionada.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  placeholder="Título da tarefa"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Prazo</label>
                <Input
                  type="date"
                  value={editTaskDeadline}
                  onChange={(e) => setEditTaskDeadline(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEditTaskModal(false)}
                disabled={isSavingTask}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingTask || !editTaskTitle}>
                {isSavingTask ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}