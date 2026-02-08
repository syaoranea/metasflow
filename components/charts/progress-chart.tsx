"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ProgressChartProps {
  data: {
    month: string
    completed: number
    total: number
  }[]
  year?: number
}

export function ProgressChart({ data, year }: ProgressChartProps) {
  const currentYear = new Date().getFullYear()
  const displayYear = year || currentYear
  
  // Calcular taxa garantindo tipo numérico consistente
  const chartData = data?.map((item) => {
    const taxa = item.total > 0 
      ? Math.round((item.completed / item.total) * 100) 
      : 0
    
    return {
      month: item.month,
      taxa: taxa,
      total: item.total,
      completed: item.completed
    }
  }) ?? []

  // Custom tooltip para mostrar mais informações do progresso acumulado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Progresso: <span className="font-medium text-foreground">{data.taxa}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Metas concluídas: <span className="font-medium text-foreground">{data.completed}/{data.total}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso Acumulado {displayYear}</CardTitle>
        <CardDescription>
          Percentual de metas concluídas ao longo do ano de {displayYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                domain={[0, 100]}
                label={{
                  value: 'Progresso (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 11 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="taxa"
                stroke="#60B5FF"
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, payload } = props
                  // Mostrar ponto maior se houver metas concluídas até este mês
                  if (payload.completed > 0) {
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={5} 
                        fill="#60B5FF" 
                        stroke="#fff" 
                        strokeWidth={2}
                      />
                    )
                  }
                  // Ponto menor para meses sem progresso ainda
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={2} 
                      fill="#94a3b8" 
                    />
                  )
                }}
                activeDot={{ r: 7, fill: '#60B5FF', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
