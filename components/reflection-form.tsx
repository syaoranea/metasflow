"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Lightbulb, AlertTriangle } from 'lucide-react'

interface ReflectionFormProps {
  goalId: string
  onSuccess: () => void
}

export function ReflectionForm({ goalId, onSuccess }: ReflectionFormProps) {
  const [whatWorked, setWhatWorked] = useState('')
  const [whatDidntWork, setWhatDidntWork] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/goals/${goalId}/reflections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatWorked, whatDidntWork }),
      })

      if (response.ok) {
        setWhatWorked('')
        setWhatDidntWork('')
        onSuccess()
      }
    } catch (error) {
      console.error('Erro ao salvar reflexão:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Reflexão</CardTitle>
        <CardDescription>
          Registre seus aprendizados sobre esta meta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatWorked" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-600" />
              O que funcionou?
            </Label>
            <Textarea
              id="whatWorked"
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="Descreva o que deu certo e por quê..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatDidntWork" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              O que não funcionou?
            </Label>
            <Textarea
              id="whatDidntWork"
              value={whatDidntWork}
              onChange={(e) => setWhatDidntWork(e.target.value)}
              placeholder="Descreva o que não deu certo e o que poderia ser diferente..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Salvando...' : 'Salvar Reflexão'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}