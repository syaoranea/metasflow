"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles } from 'lucide-react'

export default function NewGoalPage() {
  const router = useRouter()
  const { status } = useSession() || {}
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<Array<{ title: string; estimatedDays: number }>>([])

  if (status === 'unauthenticated') {
    router.replace('/login')
    return null
  }

  const handleGenerateTasks = async () => {
    if (!title) return

    setIsGeneratingTasks(true)
    setGeneratedTasks([])

    try {
      const response = await fetch('/api/ai/break-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalTitle: title, goalDescription: description }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        console.error('Erro ao gerar tarefas (API):', err)
        throw new Error(err?.error || 'Erro ao gerar tarefas com IA')
      }

      const data = await response.json()

      // 👇 Bate com o formato da rota atual
      const tasks = data?.result?.tasks ?? []

      console.log('Tarefas geradas pela IA:', tasks)
      setGeneratedTasks(tasks)
    } catch (error) {
      console.error('Erro ao gerar tarefas:', error)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          deadline: deadline || null,
        }),
      })

      if (response.ok) {
        const goal = await response.json()

        if (generatedTasks.length > 0) {
          const today = new Date()
          for (const task of generatedTasks) {
            const taskDeadline = new Date(today)
            taskDeadline.setDate(taskDeadline.getDate() + task.estimatedDays)
            
            await fetch(`/api/goals/${goal.id}/tasks`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: task.title,
                deadline: taskDeadline.toISOString(),
              }),
            })
          }
        }

        router.push(`/goals/${goal.id}`)
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar Nova Meta</CardTitle>
            <CardDescription>
              Defina uma nova meta para 2025 e organize suas tarefas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Correr minha primeira maratona"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva sua meta em detalhes..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PESSOAL">Pessoal</SelectItem>
                      <SelectItem value="CARREIRA">Carreira</SelectItem>
                      <SelectItem value="SAUDE">Saúde</SelectItem>
                      <SelectItem value="FINANCAS">Finanças</SelectItem>
                      <SelectItem value="ESTUDOS">Estudos</SelectItem>
                      <SelectItem value="RELACIONAMENTOS">Relacionamentos</SelectItem>
                      <SelectItem value="LAZER">Lazer</SelectItem>
                      <SelectItem value="ESPIRITUALIDADE">Espiritualidade</SelectItem>
                      <SelectItem value="IMPACTO_SOCIAL">Impacto Social</SelectItem>
                      <SelectItem value="BENS_DE_CONSUMO">Bens de Consumo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade *</Label>
                  <Select value={priority} onValueChange={setPriority} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="MEDIA">Média</SelectItem>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Tarefas Sugeridas por IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Use IA para quebrar sua meta em tarefas acionáveis
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateTasks}
                    disabled={!title || isGeneratingTasks}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGeneratingTasks ? 'Gerando...' : 'Gerar Tarefas'}
                  </Button>
                </div>

                {generatedTasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tarefas geradas:</p>
                    <ul className="space-y-2">
                      {generatedTasks.map((task, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm"
                        >
                          <span className="font-medium text-primary">{idx + 1}.</span>
                          <div className="flex-1">
                            <p>{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Estimativa: {task.estimatedDays} dias
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Criando...' : 'Criar Meta'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}