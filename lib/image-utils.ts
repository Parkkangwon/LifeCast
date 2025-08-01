/**
 * DALL-E 이미지 URL을 프록시를 통해 처리하는 함수
 * @param imageUrl 원본 이미지 URL
 * @returns 프록시된 이미지 URL 또는 원본 URL
 */
export function getProxiedImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // DALL-E 이미지인 경우 프록시를 통해 처리
  if (imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
    const encodedUrl = encodeURIComponent(imageUrl);
    return `/api/proxy-image?url=${encodedUrl}`;
  }
  
  // 다른 이미지 URL은 그대로 반환
  return imageUrl;
}

/**
 * 이미지 로딩 실패 시 플레이스홀더 이미지로 대체하는 함수
 * @param img HTMLImageElement
 */
export function handleImageError(img: HTMLImageElement): void {
  if (img.src && img.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
    img.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`;
  }
}

/**
 * 이미지 URL이 DALL-E 이미지인지 확인하는 함수
 * @param imageUrl 이미지 URL
 * @returns DALL-E 이미지 여부
 */
export function isDalleImage(imageUrl: string): boolean {
  return imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net');
} 