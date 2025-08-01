// 블로그/자서전 관련 타입
import { ReactNode } from "react";

export interface StorySection {
  id: string;
  title: string;
  icon: string;
  color: string;
  questions: string[];
  answers: string[];
  illustration?: string;
  editedAutobiography?: string;
  _usedPatternsSet?: Set<number>;
}

export interface Blog {
  id: string;
  author_name: string;
  password: string;
  sections: StorySection[];
  generated_images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LikeCommentState {
  [key: string]: {
    likes: number
    liked: boolean
    comments: string[]
    showComment: boolean
    commentInput: string
  }
}

export interface BlogDisplayProps {
  sections: StorySection[]
  onBack: () => void
  onViewFullAutobiography: () => void
  selectedImages: string[]
  setSelectedImages: (images: string[]) => void
  imageStyle: string
} 