import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../firebase";
import type { Post } from "../types";

export const subscribeToUserPosts = (
  userId: string,
  callback: (posts: Post[]) => void,
): Unsubscribe => {
  const q = query(collection(db, "posts"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const posts: Post[] = [];
    snapshot.forEach((d) => {
      posts.push({ id: d.id, ...d.data() } as Post);
    });

    posts.sort((a, b) => {
      const dateA = a.publishDate || "";
      const dateB = b.publishDate || "";
      return dateB.localeCompare(dateA);
    });

    callback(posts);
  });
};

export const deleteUserPost = (postId: string): Promise<void> => {
  return deleteDoc(doc(db, "posts", postId));
};

export const createUserPost = (postData: Partial<Post>): Promise<unknown> => {
  return addDoc(collection(db, "posts"), {
    ...postData,
    createdAt: serverTimestamp(),
  });
};

export const updateUserPost = (
  postId: string,
  postData: Partial<Post>,
): Promise<void> => {
  return updateDoc(doc(db, "posts", postId), {
    ...postData,
    updatedAt: serverTimestamp(),
  });
};

export const uploadMediaFile = (file: File, path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on("state_changed", null, reject, async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      resolve(url);
    });
  });
};
