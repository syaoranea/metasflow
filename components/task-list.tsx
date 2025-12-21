"use client"

import { Task } from '@prisma/client'
import { Checkbox } from './ui/checkbox'
import { Calendar, GripVertical, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from './ui/button'
import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'

interface TaskListProps {
  tasks: Task[]
  goalId: string
  onUpdate: () => void
}

export function TaskList({ tasks: initialTasks, goalId, onUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isReordering, setIsReordering] = useState(false)

  const handleToggle = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
  }

  const handleReorder = async (newTasks: Task[]) => {
    setTasks(newTasks)
    
    try {
      await fetch(`/api/goals/${goalId}/tasks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: newTasks.map((t, idx) => ({ id: t.id, order: idx }))
        }),
      })
    } catch (error) {
      console.error('Erro ao reordenar tarefas:', error)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma tarefa ainda. Adicione tarefas para começar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsReordering(!isReordering)}
        >
          {isReordering ? 'Concluir' : 'Reordenar'}
        </Button>
      </div>

      {isReordering ? (
        <Reorder.Group axis="y" values={tasks} onReorder={handleReorder} className="space-y-2">
          {tasks.map((task) => (
            <Reorder.Item key={task.id} value={task}>
              <motion.div
                layout
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border cursor-move"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className={task.completed ? 'line-through text-muted-foreground' : ''}>
                    {task.title}
                  </p>
                  {task.deadline && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.deadline), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/80 transition-colors"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => handleToggle(task.id, checked as boolean)}
              />
              <div className="flex-1">
                <p className={task.completed ? 'line-through text-muted-foreground' : ''}>
                  {task.title}
                </p>
                {task.deadline && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.deadline), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(task.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}