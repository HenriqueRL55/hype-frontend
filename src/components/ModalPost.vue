<script setup lang="ts">
import { ref, onMounted } from "vue";
import { auth } from "../firebase";
import {
  createUserPost,
  updateUserPost,
  deleteUserPost,
  uploadMediaFile,
} from "../services/postService";
import {
  iconClose,
  iconUpload,
  iconCalendar,
  iconTrash,
  iconX,
  iconChevronLeft,
  iconChevronRight,
} from "../assets/icons/iconsSVG";
import ConfirmModal from "./ConfirmModal.vue";
import type { Post, MediaUploadItem, PostMedia } from "../types";

const props = defineProps<{
  post?: Post | null;
  initialDate?: string;
}>();
const emit = defineEmits(["close"]);

const title = ref("");
const description = ref("");
const publishDate = ref("");
const mediaList = ref<MediaUploadItem[]>([]);

const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadStatusText = ref("Preparando...");
const showConfirmEdit = ref(false);
const showConfirmDelete = ref(false);
const draggedIndex = ref<number | null>(null);

const videoToPlay = ref<string | null>(null);
const mediaError = ref("");
const MAX_MEDIA = 6;

onMounted(() => {
  if (props.post) {
    title.value = props.post.title;
    description.value = props.post.description;
    publishDate.value = props.post.publishDate;

    if (props.post.media && props.post.media.length > 0) {
      const existingMedia: MediaUploadItem[] = props.post.media.map(
        (m: PostMedia, i: number) => ({
          id: `old_${i}_${Date.now()}`,
          isNew: false,
          url: m.url,
          type: m.type,
        }),
      );
      mediaList.value = existingMedia;
    } else if (props.post.mediaUrl) {
      mediaList.value = [
        {
          id: `old_0_${Date.now()}`,
          isNew: false,
          url: props.post.mediaUrl,
          type: (props.post.mediaType as "image" | "video" | "gif") || "image",
        },
      ];
    }
  } else if (props.initialDate) {
    publishDate.value = props.initialDate;
  }
});

const handleFileChange = (event: Event) => {
  mediaError.value = "";
  const target = event.target as HTMLInputElement;

  if (target.files) {
    const filesArray = Array.from(target.files);
    const availableSlots = MAX_MEDIA - mediaList.value.length;

    if (filesArray.length > availableSlots) {
      mediaError.value = `Você pode adicionar no máximo ${MAX_MEDIA} mídias. Algumas foram ignoradas.`;
    }

    const filesToAdd = filesArray.slice(0, availableSlots);

    const newFiles: MediaUploadItem[] = filesToAdd.map((file, index) => {
      let mediaType: "image" | "video" | "gif" = "image";
      if (file.type.startsWith("video/")) mediaType = "video";
      else if (file.type.includes("gif")) mediaType = "gif";

      return {
        id: `new_${index}_${Date.now()}`,
        isNew: true,
        file: file,
        url: URL.createObjectURL(file),
        type: mediaType,
      };
    });

    mediaList.value.push(...newFiles);
  }
  target.value = "";
};

const removeMedia = (index: number) => {
  mediaList.value.splice(index, 1);
  mediaError.value = "";
};

const moveLeft = (index: number) => {
  if (index > 0) {
    const currentList = [...mediaList.value];
    const temp = currentList[index] as MediaUploadItem;
    currentList[index] = currentList[index - 1] as MediaUploadItem;
    currentList[index - 1] = temp;
    mediaList.value = currentList;
  }
};

const moveRight = (index: number) => {
  if (index < mediaList.value.length - 1) {
    const currentList = [...mediaList.value];
    const temp = currentList[index] as MediaUploadItem;
    currentList[index] = currentList[index + 1] as MediaUploadItem;
    currentList[index + 1] = temp;
    mediaList.value = currentList;
  }
};

const dragStart = (index: number) => {
  draggedIndex.value = index;
};

const drop = (index: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const currentList = [...mediaList.value];
    const item = currentList.splice(
      draggedIndex.value,
      1,
    )[0] as MediaUploadItem;
    currentList.splice(index, 0, item);
    mediaList.value = currentList;
  }
  draggedIndex.value = null;
};

const playVideo = (url: string | undefined) => {
  if (url) {
    videoToPlay.value = url;
  }
};

const closeVideo = () => {
  videoToPlay.value = null;
};

const triggerSubmit = () => {
  if (!title.value || !description.value || !publishDate.value) return;
  if (mediaList.value.length === 0) {
    mediaError.value = "Adicione pelo menos uma mídia.";
    return;
  }

  if (props.post) {
    showConfirmEdit.value = true;
  } else {
    executeSubmit();
  }
};

const triggerDelete = () => {
  if (!props.post) return;
  showConfirmDelete.value = true;
};

const executeDelete = async () => {
  if (!props.post) return;
  showConfirmDelete.value = false;
  isUploading.value = true;
  uploadStatusText.value = "Excluindo publicação...";
  try {
    await deleteUserPost(props.post.id);
    emit("close");
  } catch (error) {
    console.error(error);
    isUploading.value = false;
  }
};

const executeSubmit = async () => {
  showConfirmEdit.value = false;
  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const totalNewFiles = mediaList.value.filter((m) => m.isNew).length;
    let completedFiles = 0;

    const finalMedia = [];

    for (let i = 0; i < mediaList.value.length; i++) {
      const item = mediaList.value[i];

      if (!item) continue;

      if (item.isNew && item.file) {
        const fileExt = item.file.name.split(".").pop();
        const fileName = `posts/${Date.now()}_${i}.${fileExt}`;

        const tipoDescritivo =
          item.type === "video"
            ? "vídeo"
            : item.type === "gif"
              ? "GIF"
              : "imagem";
        uploadStatusText.value = `Enviando ${tipoDescritivo} ${completedFiles + 1} de ${totalNewFiles}...`;

        await new Promise((r) => setTimeout(r, 600));

        const url = await uploadMediaFile(item.file, fileName);
        completedFiles++;

        if (totalNewFiles > 0) {
          uploadProgress.value = Math.round(
            (completedFiles / totalNewFiles) * 100,
          );
        }

        finalMedia.push({ url, type: item.type });
      } else {
        finalMedia.push({ url: item.url as string, type: item.type });
      }
    }

    uploadStatusText.value = "Salvando os dados da publicação...";
    await new Promise((r) => setTimeout(r, 600));

    const postData: Partial<Post> = {
      title: title.value,
      description: description.value,
      publishDate: publishDate.value,
      media: finalMedia,
      mediaUrl: "",
      mediaType: "image",
    };

    if (props.post) {
      await updateUserPost(props.post.id, postData);
    } else {
      postData.userId = auth.currentUser?.uid;
      await createUserPost(postData);
    }

    isUploading.value = false;
    emit("close");
  } catch (error) {
    console.error(error);
    isUploading.value = false;
  }
};
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-top">
        <h2>{{ props.post ? "Editar Post" : "Criar Post" }}</h2>
        <div class="top-actions">
          <button
            v-if="props.post"
            type="button"
            class="btn-trash-modal"
            @click="triggerDelete"
            v-html="iconTrash"
            :disabled="isUploading"
          ></button>
          <button
            type="button"
            class="btn-close"
            @click="emit('close')"
            v-html="iconClose"
            :disabled="isUploading"
          ></button>
        </div>
      </div>

      <form @submit.prevent="triggerSubmit">
        <div class="field-group">
          <label>Título</label>
          <input type="text" v-model="title" :disabled="isUploading" required />
        </div>

        <div class="field-group">
          <label>Descrição</label>
          <textarea
            v-model="description"
            maxlength="500"
            :disabled="isUploading"
            required
          ></textarea>
          <span class="char-count">{{ description.length }}/500</span>
        </div>

        <div class="field-group">
          <label class="label-with-icon">
            <span class="icon" v-html="iconCalendar"></span> Data de publicação
          </label>
          
          <input
            type="date"
            v-model="publishDate"
            :disabled="isUploading"
            required
            placeholder="dd/mm/aaaa"
            :class="{ 'is-empty': !publishDate }"
          />
        </div>

        <div class="field-group">
          <div class="media-label-wrapper">
            <label>Mídias (Arraste ou use as setas para ordenar)</label>
            <span class="media-count"
              >{{ mediaList.length }}/{{ MAX_MEDIA }}</span
            >
          </div>

          <div class="media-carousel-preview" v-if="mediaList.length > 0">
            <div
              class="media-thumb-wrapper"
              v-for="(item, index) in mediaList"
              :key="item.id"
              draggable="true"
              @dragstart="dragStart(index)"
              @dragover.prevent
              @drop="drop(index)"
            >
              <span class="order-badge">{{ index + 1 }}</span>

              <img
                v-if="item.type === 'image' || item.type === 'gif'"
                :src="item.url"
              />
              <video
                v-else
                :src="item.url"
                muted
                @click.stop="playVideo(item.url)"
                class="playable-video"
              ></video>

              <div class="thumb-actions">
                <button
                  type="button"
                  @click.stop="moveLeft(index)"
                  :disabled="index === 0 || isUploading"
                  v-html="iconChevronLeft"
                ></button>
                <button
                  type="button"
                  class="btn-del"
                  @click.stop="removeMedia(index)"
                  :disabled="isUploading"
                  v-html="iconX"
                ></button>
                <button
                  type="button"
                  @click.stop="moveRight(index)"
                  :disabled="index === mediaList.length - 1 || isUploading"
                  v-html="iconChevronRight"
                ></button>
              </div>
            </div>
          </div>

          <div class="dropzone" v-if="mediaList.length < MAX_MEDIA">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              @change="handleFileChange"
              :disabled="isUploading"
              :required="mediaList.length === 0"
            />
            <div class="dropzone-content">
              <span class="icon-up" v-html="iconUpload"></span>
              <p class="dropzone-title">Clique para adicionar mídias</p>
              <p class="dropzone-subtitle">PNG, JPG, GIF, MP4, WEBM</p>
            </div>
          </div>

          <p v-if="mediaError" class="media-error-msg">{{ mediaError }}</p>
        </div>

        <div v-if="isUploading" class="progress-container">
          <div class="progress-info">
            <span>{{ uploadStatusText }}</span>
            <span class="pct" v-if="mediaList.some((m) => m.isNew)"
              >{{ uploadProgress }}%</span
            >
          </div>
          <div class="progress-track" v-if="mediaList.some((m) => m.isNew)">
            <div
              class="progress-fill"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <div class="modal-buttons" :class="{ uploading: isUploading }">
          <button
            type="button"
            class="btn-cancel"
            @click="emit('close')"
            :disabled="isUploading"
          >
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="isUploading">
            <template v-if="isUploading">Aguarde...</template>
            <template v-else>{{
              props.post ? "Salvar Alterações" : "Criar Post"
            }}</template>
          </button>
        </div>
      </form>
    </div>

    <ConfirmModal
      v-if="showConfirmEdit"
      title="Salvar alterações"
      message="Tem certeza que deseja aplicar estas mudanças no post?"
      confirmText="Salvar"
      @confirm="executeSubmit"
      @cancel="showConfirmEdit = false"
    />

    <ConfirmModal
      v-if="showConfirmDelete"
      title="Excluir post"
      message="Esta ação é permanente e não pode ser desfeita. Deseja excluir este post?"
      confirmText="Excluir"
      :isDanger="true"
      @confirm="executeDelete"
      @cancel="showConfirmDelete = false"
    />

    <div
      v-if="videoToPlay"
      class="video-player-overlay"
      @click.self="closeVideo"
    >
      <div class="video-player-container">
        <button
          class="btn-close-video"
          @click="closeVideo"
          v-html="iconClose"
        ></button>
        <video :src="videoToPlay" controls autoplay></video>
      </div>
    </div>
  </div>
</template>