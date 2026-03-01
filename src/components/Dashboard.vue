<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import { auth } from "../firebase";
import { logoutUser } from "../services/authService";
import { subscribeToUserPosts, deleteUserPost } from "../services/postService";
import ModalPost from "./ModalPost.vue";
import ConfirmModal from "./ConfirmModal.vue";
import type { Post } from "../types";
import type { Unsubscribe } from "firebase/firestore";
import {
  iconLogout,
  iconCalendar,
  iconGrid,
  iconTrash,
  iconArrowLeft,
  iconChevronLeft,
  iconChevronRight,
  iconSearch,
  iconFilter,
  iconClose,
} from "../assets/icons/iconsSVG";
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  parseISO,
  isSameDay,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  subMonths,
  addMonths,
  isSameMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  hasMultipleMedia,
  getCoverMedia,
  getFirstMedia,
  getMediaBadgeIcon,
  getMediaBadgeLabel,
} from "../utils/mediaHelpers";

defineProps<{ userEmail: string }>();

const savedView = localStorage.getItem("hypeViewMode") as
  | "grid"
  | "calendar"
  | "day"
  | null;
const viewMode = ref<"grid" | "calendar" | "day">(
  savedView && savedView !== "day" ? savedView : "calendar",
);

watch(viewMode, (newVal) => {
  if (newVal !== "day") {
    localStorage.setItem("hypeViewMode", newVal);
  }
});

const calendarType = ref<"week" | "month">("week");
const isModalOpen = ref(false);
const selectedPost = ref<Post | null>(null);
const posts = ref<Post[]>([]);
const currentDate = ref(new Date());
const searchQuery = ref("");
const filterDate = ref("");

const initialDateForModal = ref("");
const postToDelete = ref<string | null>(null);
const selectedDayView = ref<Date | null>(null);
const mediaIndexMap = ref<Record<string, number>>({});
let unsubscribePosts: Unsubscribe | null = null;

onMounted(() => {
  const user = auth.currentUser;
  if (!user) return;

  unsubscribePosts = subscribeToUserPosts(user.uid, (fetchedPosts) => {
    fetchedPosts.forEach((post) => {
      if (mediaIndexMap.value[post.id] === undefined) {
        mediaIndexMap.value[post.id] = 0;
      }
    });
    posts.value = fetchedPosts;
  });
});

onUnmounted(() => {
  if (unsubscribePosts) unsubscribePosts();
});

const logout = async () => {
  await logoutUser();
};

const triggerDelete = (id: string) => {
  postToDelete.value = id;
};

const executeDelete = async () => {
  if (postToDelete.value) {
    await deleteUserPost(postToDelete.value);
    postToDelete.value = null;
  }
};

const openCreateModal = () => {
  selectedPost.value = null;
  if (viewMode.value === "day" && selectedDayView.value) {
    initialDateForModal.value = format(selectedDayView.value, "yyyy-MM-dd");
  } else if (viewMode.value === "grid" && filterDate.value) {
    initialDateForModal.value = filterDate.value;
  } else {
    initialDateForModal.value = "";
  }
  isModalOpen.value = true;
};

const openEditModal = (post: Post) => {
  selectedPost.value = post;
  isModalOpen.value = true;
};

const openDayView = (day: Date) => {
  selectedDayView.value = day;
  viewMode.value = "day";
};

const closeDayView = () => {
  selectedDayView.value = null;
  viewMode.value = "calendar";
};

const prevMedia = (post: Post) => {
  const current = mediaIndexMap.value[post.id] || 0;
  if (current > 0) mediaIndexMap.value[post.id] = current - 1;
};

const nextMedia = (post: Post) => {
  const current = mediaIndexMap.value[post.id] || 0;
  if (post.media && current < post.media.length - 1)
    mediaIndexMap.value[post.id] = current + 1;
};

const playVideoPreview = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  video.play().catch(() => {});
};

const pauseVideoPreview = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  video.pause();
  video.currentTime = 0;
};

const filteredPosts = computed(() => {
  let filtered = posts.value;
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower),
    );
  }
  if (filterDate.value) {
    filtered = filtered.filter((p) => p.publishDate === filterDate.value);
  }
  return filtered;
});

const calendarDays = computed(() => {
  if (calendarType.value === "week") {
    const start = startOfWeek(currentDate.value, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  } else {
    const start = startOfWeek(startOfMonth(currentDate.value), {
      weekStartsOn: 1,
    });
    const end = endOfWeek(endOfMonth(currentDate.value), { weekStartsOn: 1 });
    const days = [];
    let curr = start;
    while (curr <= end) {
      days.push(curr);
      curr = addDays(curr, 1);
    }
    return days;
  }
});

const getPostsForDay = (day: Date | null) => {
  if (!day) return [];
  return posts.value.filter(
    (p) => p.publishDate && isSameDay(parseISO(p.publishDate), day),
  );
};

const calendarHeaderLabel = computed(() => {
  if (calendarType.value === "week") {
    const start = calendarDays.value[0];
    const end = calendarDays.value[6];
    if (!start || !end) return "";
    return `Semana de ${format(start, "dd 'de' MMM", { locale: ptBR })} até ${format(end, "dd 'de' MMM", { locale: ptBR })}`;
  } else {
    const text = format(currentDate.value, "MMMM 'de' yyyy", { locale: ptBR });
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
});

const nextPeriod = () => {
  if (calendarType.value === "week")
    currentDate.value = addWeeks(currentDate.value, 1);
  else currentDate.value = addMonths(currentDate.value, 1);
};

const prevPeriod = () => {
  if (calendarType.value === "week")
    currentDate.value = subWeeks(currentDate.value, 1);
  else currentDate.value = subMonths(currentDate.value, 1);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return format(parseISO(dateString), "dd 'de' MMM, yyyy", { locale: ptBR });
};
</script>

<template>
  <div class="dashboard-layout">
    <header class="topbar">
      <div class="topbar-content">
        <h1 class="logo">
          <span class="logo-blue">hype</span
          ><span class="logo-black">social</span>
        </h1>
        <div class="user-actions">
          <span class="user-email">{{ userEmail }}</span>
          <button
            class="btn-logout"
            @click="logout"
            v-html="iconLogout"
          ></button>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="dashboard-header">
        <div class="header-titles">
          <h2>Meus Posts</h2>
          <span>{{ posts.length }} posts cadastrados</span>
        </div>

        <div class="header-tools" v-if="viewMode !== 'day'">
          <div v-if="viewMode === 'grid'" class="filters-container">
            <div class="search-bar">
              <span class="search-icon" v-html="iconSearch"></span>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Buscar posts..."
              />
            </div>
            <div class="date-filter">
              <span class="filter-icon" v-html="iconFilter"></span>
              
              <input
                type="date"
                v-model="filterDate"
                placeholder="Filtrar data..."
                :class="{ 'is-empty': !filterDate }"
              />
              <button
                v-if="filterDate"
                class="clear-filter"
                @click="filterDate = ''"
                v-html="iconClose"
              ></button>
            </div>
          </div>

          <div class="header-actions">
            <div class="view-toggle">
              <button
                :class="{ active: viewMode === 'calendar' }"
                @click="viewMode = 'calendar'"
                v-html="iconCalendar"
              ></button>
              <button
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
                v-html="iconGrid"
              ></button>
            </div>
            <button class="btn-primary" @click="openCreateModal">
              + Criar Post
            </button>
          </div>
        </div>

        <div class="header-tools" v-else>
          <div class="header-actions">
            <button class="btn-primary" @click="openCreateModal">
              + Criar Post
            </button>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'grid'" class="grid-view">
        <div
          class="post-card"
          v-for="post in filteredPosts"
          :key="post.id"
          @click="openEditModal(post)"
        >
          <div class="card-image">
            <div class="badge-image">
              <span
                class="badge-icon"
                v-html="getMediaBadgeIcon(post, mediaIndexMap[post.id] || 0)"
              ></span>
              {{ getMediaBadgeLabel(post, mediaIndexMap[post.id] || 0) }}
            </div>

            <button
              v-if="hasMultipleMedia(post) && (mediaIndexMap[post.id] || 0) > 0"
              class="carousel-nav prev"
              @click.stop="prevMedia(post)"
              v-html="iconChevronLeft"
            ></button>

            <img
              v-if="
                getCoverMedia(post, mediaIndexMap[post.id] || 0)?.type ===
                  'image' ||
                getCoverMedia(post, mediaIndexMap[post.id] || 0)?.type === 'gif'
              "
              :src="getCoverMedia(post, mediaIndexMap[post.id] || 0)?.url"
            />
            <video
              v-else-if="
                getCoverMedia(post, mediaIndexMap[post.id] || 0)?.type ===
                'video'
              "
              :src="getCoverMedia(post, mediaIndexMap[post.id] || 0)?.url"
              muted
              loop
              playsinline
              @mouseenter="playVideoPreview"
              @mouseleave="pauseVideoPreview"
            ></video>

            <button
              v-if="
                hasMultipleMedia(post) &&
                (mediaIndexMap[post.id] || 0) < (post.media?.length || 0) - 1
              "
              class="carousel-nav next"
              @click.stop="nextMedia(post)"
              v-html="iconChevronRight"
            ></button>
          </div>
          <div class="card-content">
            <div class="card-info">
              <h3>{{ post.title }}</h3>
              <button
                class="btn-trash"
                @click.stop="triggerDelete(post.id)"
                v-html="iconTrash"
              ></button>
            </div>
            <p class="desc">{{ post.description }}</p>
            <span class="date">{{ formatDate(post.publishDate) }}</span>
          </div>
        </div>
        <div v-if="filteredPosts.length === 0" class="empty-state">
          Nenhum post encontrado.
        </div>
      </div>

      <div v-if="viewMode === 'calendar'" class="calendar-view">
        <div class="calendar-topbar">
          <div class="calendar-nav-center">
            <button @click="prevPeriod" v-html="iconChevronLeft"></button>
            <p class="period-label">{{ calendarHeaderLabel }}</p>
            <button @click="nextPeriod" v-html="iconChevronRight"></button>
          </div>
          <div class="calendar-type-toggle">
            <button
              :class="{ active: calendarType === 'week' }"
              @click="calendarType = 'week'"
            >
              Semana
            </button>
            <button
              :class="{ active: calendarType === 'month' }"
              @click="calendarType = 'month'"
            >
              Mês
            </button>
          </div>
        </div>

        <div class="calendar-grid-wrapper">
          <div class="calendar-grid-header">
            <div
              class="weekday-label"
              v-for="day in ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']"
              :key="day"
            >
              {{ day }}
            </div>
          </div>
          <div
            class="calendar-grid-body"
            :class="{ 'is-month': calendarType === 'month' }"
          >
            <div
              class="day-col"
              v-for="day in calendarDays"
              :key="day.toISOString()"
              :class="{
                today: isSameDay(day, new Date()),
                'out-of-month':
                  calendarType === 'month' && !isSameMonth(day, currentDate),
              }"
              @click="openDayView(day)"
            >
              <div class="day-header">
                <span v-if="calendarType === 'week'" class="day-name">{{
                  format(day, "E", { locale: ptBR })
                    .toUpperCase()
                    .replace(".", "")
                }}</span>
                <span class="day-num">{{ format(day, "dd") }}</span>
              </div>
              <div class="day-entries">
                <div
                  class="entry-item"
                  v-for="post in getPostsForDay(day).slice(0, 2)"
                  :key="post.id"
                  @click.stop="openEditModal(post)"
                >
                  <img
                    v-if="
                      getFirstMedia(post)?.type === 'image' ||
                      getFirstMedia(post)?.type === 'gif'
                    "
                    :src="getFirstMedia(post)?.url"
                  />
                  <video
                    v-else-if="getFirstMedia(post)?.type === 'video'"
                    :src="getFirstMedia(post)?.url"
                    muted
                    loop
                    playsinline
                    @mouseenter="playVideoPreview"
                    @mouseleave="pauseVideoPreview"
                  ></video>
                  <span class="entry-title">{{ post.title }}</span>
                </div>
                <div
                  v-if="getPostsForDay(day).length > 2"
                  class="more-posts-indicator"
                >
                  + {{ getPostsForDay(day).length - 2 }} mais
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'day'" class="day-view-container">
        <div class="day-view-header">
          <button class="btn-back" @click="closeDayView">
            <span class="icon" v-html="iconArrowLeft"></span> Voltar
          </button>
          <h3 v-if="selectedDayView">
            Posts de
            {{ format(selectedDayView, "dd 'de' MMMM", { locale: ptBR }) }}
          </h3>
        </div>

        <div class="grid-view">
          <div
            class="post-card"
            v-for="post in getPostsForDay(selectedDayView)"
            :key="post.id"
            @click="openEditModal(post)"
          >
            <div class="card-image">
              <div class="badge-image">
                <span
                  class="badge-icon"
                  v-html="getMediaBadgeIcon(post, mediaIndexMap[post.id] || 0)"
                ></span>
                {{ getMediaBadgeLabel(post, mediaIndexMap[post.id] || 0) }}
              </div>

              <button
                v-if="
                  hasMultipleMedia(post) && (mediaIndexMap[post.id] || 0) > 0
                "
                class="carousel-nav prev"
                @click.stop="prevMedia(post)"
                v-html="iconChevronLeft"
              ></button>

              <img
                v-if="
                  getCoverMedia(post, mediaIndexMap[post.id] || 0)?.type ===
                    'image' ||
                  getCoverMedia(post, mediaIndexMap[post.id] || 0)?.type ===
                    'gif'
                "
                :src="getCoverMedia(post, mediaIndexMap[post.id] || 0)?.url"
              />
              <video
                v-else-if="
                  getCoverMedia(post, mediaIndexMap[post.id] || 0)?.type ===
                  'video'
                "
                :src="getCoverMedia(post, mediaIndexMap[post.id] || 0)?.url"
                muted
                loop
                playsinline
                @mouseenter="playVideoPreview"
                @mouseleave="pauseVideoPreview"
              ></video>

              <button
                v-if="
                  hasMultipleMedia(post) &&
                  (mediaIndexMap[post.id] || 0) < (post.media?.length || 0) - 1
                "
                class="carousel-nav next"
                @click.stop="nextMedia(post)"
                v-html="iconChevronRight"
              ></button>
            </div>
            <div class="card-content">
              <div class="card-info">
                <h3>{{ post.title }}</h3>
                <button
                  class="btn-trash"
                  @click.stop="triggerDelete(post.id)"
                  v-html="iconTrash"
                ></button>
              </div>
              <p class="desc">{{ post.description }}</p>
            </div>
          </div>
          <div
            v-if="getPostsForDay(selectedDayView).length === 0"
            class="empty-state"
          >
            Nenhum post neste dia.
          </div>
        </div>
      </div>
    </main>

    <ModalPost
      v-if="isModalOpen"
      :post="selectedPost"
      :initial-date="initialDateForModal"
      @close="isModalOpen = false"
    />

    <ConfirmModal
      v-if="postToDelete"
      title="Excluir post"
      message="Esta ação é permanente e não pode ser desfeita. Deseja excluir este post?"
      confirmText="Excluir"
      :isDanger="true"
      @confirm="executeDelete"
      @cancel="postToDelete = null"
    />
  </div>
</template>