"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ProgressChartProps {
  data: {
    month: string
    completed: number
    total: number
  }[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data?.map((item) => ({
    month: item.month,
    taxa: item.total > 0 ? ((item.completed / item.total) * 100).toFixed(0) : 0,
  })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso Mensal</CardTitle>
        <CardDescription>Taxa de conclusão de metas por mês</CardDescription>
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
