"use client"

import React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Target, Clock, TrendingUp, AlertCircle } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ label, value, subtext, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p 
              className="text-2xl font-mono font-bold mt-1"
              style={{ color }}
            >
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            )}
          </div>
          <div 
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active Applications"
        value={12}
        subtext="3 this week"
        icon={Target}
        color="#00F2FF"
      />
      <StatCard
        label="Response Rate"
        value="42%"
        subtext="+5% from last month"
        icon={TrendingUp}
        color="#10B981"
      />
      <StatCard
        label="Avg. Response Time"
        value="4.2d"
        subtext="Getting faster"
        icon={Clock}
        color="#F59E0B"
      />
      <StatCard
        label="Pending Responses"
        value={5}
        subtext="2 overdue"
        icon={AlertCircle}
        color="#EF4444"
      />
    </div>
  )
}
