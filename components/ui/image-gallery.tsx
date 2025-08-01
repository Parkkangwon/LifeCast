import * as React from "react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[]
  maxImages?: number
  imageClassName?: string
  containerClassName?: string
}

export function ImageGallery({
  images,
  maxImages = 4,
  imageClassName,
  containerClassName,
  ...props
}: ImageGalleryProps) {
  if (!images?.length) return null

  return (
    <div 
      className={cn(
        "flex flex-wrap justify-center gap-4 mb-8",
        containerClassName
      )} 
      {...props}
    >
      {images.slice(0, maxImages).map((img, idx) => (
        <div 
          key={idx} 
          className={cn(
            "w-40 h-40 rounded-xl overflow-hidden border-2 border-amber-200 shadow",
            imageClassName
          )}
        >
          <img 
            src={img} 
            alt={`이미지 ${idx + 1}`} 
            className="object-cover w-full h-full" 
          />
        </div>
      ))}
    </div>
  )
} 