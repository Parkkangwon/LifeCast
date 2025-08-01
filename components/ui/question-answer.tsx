import * as React from "react"
import { cn } from "@/lib/utils"
import { Quote } from "lucide-react"

interface QuestionAnswerProps extends React.HTMLAttributes<HTMLDivElement> {
  question: string
  answer: string
  questionNumber?: number
  className?: string
}

export function QuestionAnswer({
  question,
  answer,
  questionNumber,
  className,
  ...props
}: QuestionAnswerProps) {
  if (!answer?.trim()) return null

  return (
    <div className={cn("mb-8 last:mb-0", className)} {...props}>
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
          {questionNumber !== undefined && (
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {questionNumber + 1}
            </div>
          )}
          <h3 className="font-semibold text-amber-800">{question}</h3>
        </div>
      </div>

      <div className="bg-white bg-opacity-80 rounded-lg p-6 shadow-sm border border-amber-200">
        <div className="relative">
          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-amber-300" />
          <p className="text-gray-700 leading-relaxed text-lg italic pl-6">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
} 