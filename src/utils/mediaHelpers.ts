import type { Post } from '../types';
import { iconImage, iconVideo, iconImages } from '../assets/icons/iconsSVG';

export const hasMultipleMedia = (post: Post) => {
  return post.media && post.media.length > 1;
};

export const getCoverMedia = (post: Post, currentIndex: number = 0): { url: string, type: string } | null => {
  if (post.media && post.media.length > 0) {
    return post.media[currentIndex] || null;
  }
  if (post.mediaUrl) {
    return { url: post.mediaUrl, type: post.mediaType || 'image' };
  }
  return null;
};

export const getFirstMedia = (post: Post): { url: string, type: string } | null => {
  if (post.media && post.media.length > 0) {
    return post.media[0] || null;
  }
  if (post.mediaUrl) {
    return { url: post.mediaUrl, type: post.mediaType || 'image' };
  }
  return null;
};

export const getCurrentMediaType = (post: Post, currentIndex: number = 0) => {
  const cover = getCoverMedia(post, currentIndex);
  return cover ? cover.type : 'image';
};

export const getMediaBadgeIcon = (post: Post, currentIndex: number = 0) => {
  if (hasMultipleMedia(post)) return iconImages;
  const type = getCurrentMediaType(post, currentIndex);
  return type === 'video' ? iconVideo : iconImage;
};

export const getMediaBadgeLabel = (post: Post, currentIndex: number = 0) => {
  if (hasMultipleMedia(post)) return `${currentIndex + 1} / ${post.media?.length}`;
  const type = getCurrentMediaType(post, currentIndex);
  return type === 'video' ? 'Vídeo' : type === 'gif' ? 'GIF' : 'Imagem';
};