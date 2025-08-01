import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  className?: string
  children?: React.ReactNode
}

export function SectionCard({ 
  icon, 
  title, 
  subtitle,
  className,
  children,
  ...props 
}: SectionCardProps) {
  return (
    <Card className={cn("mb-8", className)} {...props}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-amber-200">
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white">
              {icon}
            </div>
          )}
          <h2 className="text-2xl font-bold text-amber-800">{title}</h2>
        </div>
        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      </div>
      {children}
    </Card>
  )
} 