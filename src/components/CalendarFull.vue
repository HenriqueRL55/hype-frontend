<script setup lang="ts">
import { ref, computed } from "vue";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Post } from "../types";

const props = defineProps<{ posts: Post[] }>();
const emit = defineEmits(["edit-post"]);

type CalendarView = "month" | "week";

const currentView = ref<CalendarView>("month");
const currentDate = ref(new Date());

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const calendarDays = computed(() => {
  let start, end;

  if (currentView.value === "month") {
    const monthStart = startOfMonth(currentDate.value);
    const monthEnd = endOfMonth(monthStart);
    start = startOfWeek(monthStart, { weekStartsOn: 0 });
    end = endOfWeek(monthEnd, { weekStartsOn: 0 });
  } else {
    start = startOfWeek(currentDate.value, { weekStartsOn: 0 });
    end = endOfWeek(currentDate.value, { weekStartsOn: 0 });
  }

  return eachDayOfInterval({ start, end });
});

const headerTitle = computed(() => {
  if (currentView.value === "month") {
    const text = format(currentDate.value, "MMMM yyyy", { locale: ptBR });
    return text.charAt(0).toUpperCase() + text.slice(1);
  } else {
    const start = startOfWeek(currentDate.value, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate.value, { weekStartsOn: 0 });
    return `Semana de ${format(start, "dd/MM")} até ${format(end, "dd/MM yyyy")}`;
  }
});

const navigate = (direction: "prev" | "next") => {
  if (currentView.value === "month") {
    currentDate.value =
      direction === "prev"
        ? subMonths(currentDate.value, 1)
        : addMonths(currentDate.value, 1);
  } else {
    currentDate.value =
      direction === "prev"
        ? subWeeks(currentDate.value, 1)
        : addWeeks(currentDate.value, 1);
  }
};

const jumpToToday = () => {
  currentDate.value = new Date();
};

const getPostDate = (post: Post): Date | null => {
  if (!post.createdAt) return null;
  if (
    typeof post.createdAt === "object" &&
    "toDate" in post.createdAt &&
    typeof post.createdAt.toDate === "function"
  ) {
    return post.createdAt.toDate();
  }
  if (typeof post.createdAt === "string") return parseISO(post.createdAt);
  return null;
};

const getPostsForDay = (day: Date) => {
  return props.posts.filter((post) => {
    const postDate = getPostDate(post);
    return postDate && isSameDay(postDate, day);
  });
};

const getEntryCover = (post: Post): { url: string; type: string } | null => {
  if (post.media && post.media.length > 0) {
    return post.media[0] || null;
  }
  if (post.mediaUrl) {
    return { url: post.mediaUrl, type: post.mediaType || "image" };
  }
  return null;
};
</script>

<template>
  <div class="calendar-root">
    <header class="calendar-nav-header">
      <div class="nav-controls">
        <button class="icon-btn" @click="navigate('prev')">&lt;</button>
        <button class="icon-btn" @click="jumpToToday">Hoje</button>
        <button class="icon-btn" @click="navigate('next')">&gt;</button>
        <h2>{{ headerTitle }}</h2>
      </div>

      <div class="view-switcher">
        <button
          :class="{ active: currentView === 'month' }"
          @click="currentView = 'month'"
        >
          Mês
        </button>
        <button
          :class="{ active: currentView === 'week' }"
          @click="currentView = 'week'"
        >
          Semana
        </button>
      </div>
    </header>

    <div
      class="calendar-grid-container"
      :style="{ gridTemplateColumns: `repeat(7, 1fr)` }"
    >
      <div v-for="day in weekDays" :key="day" class="calendar-day-label">
        {{ day }}
      </div>

      <div
        v-for="day in calendarDays"
        :key="day.toString()"
        class="calendar-cell"
        :class="{
          'other-month':
            currentView === 'month' && !isSameMonth(day, currentDate),
          today: isSameDay(day, new Date()),
        }"
      >
        <span class="day-number">{{ format(day, "d") }}</span>

        <div class="cell-posts">
          <div
            v-for="post in getPostsForDay(day)"
            :key="post.id"
            class="post-calendar-entry"
            @click="emit('edit-post', post)"
          >
            <video
              v-if="getEntryCover(post)?.type === 'video'"
              :src="getEntryCover(post)?.url"
              class="entry-thumb"
              muted
            ></video>
            <img
              v-else-if="getEntryCover(post)?.type === 'image'"
              :src="getEntryCover(post)?.url"
              class="entry-thumb"
            />
            <h4>{{ post.title }}</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
