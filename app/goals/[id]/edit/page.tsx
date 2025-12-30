"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Tipo atualizado para funcionar com Firestore
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
}

export default function EditGoalPage() {
  const params = useParams()
  const router = useRouter()
  const { status } = useSession() || {}
  const [goal, setGoal] = useState<Goal | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [deadline, setDeadline] = useState('')
  const [goalStatus, setGoalStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        const data: Goal = await response.json()
        setGoal(data)
        setTitle(data.title)
        setDescription(data.description || '')
        setCategory(data.category)
        setPriority(data.priority)
        setGoalStatus(data.status)
        setDeadline(data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao buscar meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/goals/${params?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          deadline: deadline || null,
          status: goalStatus,
        }),
      })

      if (response.ok) {
        router.push(`/goals/${params?.id}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar meta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !goal) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Meta</CardTitle>
            <CardDescription>Atualize os detalhes da sua meta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue />
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="MEDIA">Média</SelectItem>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={goalStatus} onValueChange={setGoalStatus} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                      <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                      <SelectItem value="PAUSADA">Pausada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}