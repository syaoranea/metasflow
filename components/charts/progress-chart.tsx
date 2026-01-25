"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Goal {
  deadline?: string
  status: string
}

interface ProgressChartProps {
  goals: Goal[]
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function ProgressChart({ goals }: ProgressChartProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())

  const availableYears = [2025, 2026, 2027]

  const monthlyData = MONTHS.map((month) => ({
    month,
    completed: 0,
    total: 0,
  }))

  goals.forEach((goal) => {
    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline)
      const goalYear = deadlineDate.getFullYear()
      if (goalYear.toString() === selectedYear) {
        const monthIndex = deadlineDate.getMonth()
        monthlyData[monthIndex].total += 1
        if (goal.status === 'CONCLUIDA') {
          monthlyData[monthIndex].completed += 1
        }
      }
    }
  })

  const chartData = monthlyData.map((item) => ({
    month: item.month,
    taxa: item.total > 0 ? ((item.completed / item.total) * 100).toFixed(0) : 0,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Progresso Mensal</CardTitle>
            <CardDescription>Taxa de conclusão de metas por mês</CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="month"
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{
                  value: 'Mês',
                  position: 'insideBottom',
                  offset: -15,
                  style: { textAnchor: 'middle', fontSize: 11 },
                }}
              />
              <YAxis
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{
                  value: 'Taxa (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                formatter={(value: any) => [`${value}%`, 'Taxa de Conclusão']}
              />
              <Line
                type="monotone"
                dataKey="taxa"
                stroke="#60B5FF"
                strokeWidth={2}
                dot={{ fill: '#60B5FF', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
