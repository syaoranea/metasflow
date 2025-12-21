"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { X } from 'lucide-react'

interface FilterBarProps {
  categoryFilter: string
  statusFilter: string
  onCategoryChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClear: () => void
}

export function FilterBar({
  categoryFilter,
  statusFilter,
  onCategoryChange,
  onStatusChange,
  onClear,
}: FilterBarProps) {
  const hasFilters = categoryFilter !== 'TODAS' || statusFilter !== 'TODOS'

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex-1 min-w-[200px]">
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas Categorias</SelectItem>
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

      <div className="flex-1 min-w-[200px]">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos Status</SelectItem>
            <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
            <SelectItem value="CONCLUIDA">Concluída</SelectItem>
            <SelectItem value="PAUSADA">Pausada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="outline" size="icon" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}