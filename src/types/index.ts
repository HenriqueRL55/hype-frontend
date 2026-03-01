export interface PostMedia {
  url: string;
  type: "image" | "video" | "gif";
}

export interface Post {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  userId?: string;
  media?: PostMedia[];
  mediaUrl?: string;
  mediaType?: "image" | "video" | "gif";
  createdAt?: any;
  updatedAt?: any;
}

export interface MediaUploadItem {
  id: string;
  isNew: boolean;
  file?: File;
  url?: string;
  type: "image" | "video" | "gif";
}

export interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}