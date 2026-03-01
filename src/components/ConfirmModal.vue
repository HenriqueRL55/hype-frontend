<script setup lang="ts">
import { iconAlert } from "../assets/icons/iconsSVG";
import type { ConfirmModalProps } from "../types";

defineProps<ConfirmModalProps>();

const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div class="modal-overlay confirm-overlay" @click.self="emit('cancel')">
    <div class="confirm-box">
      <div v-if="isDanger" class="confirm-icon" v-html="iconAlert"></div>
      <h3 class="confirm-title">{{ title }}</h3>
      <p class="confirm-message">{{ message }}</p>

      <div class="confirm-actions">
        <button class="btn-cancel" @click="emit('cancel')">
          {{ cancelText || "Cancelar" }}
        </button>
        <button
          class="btn-confirm"
          :class="{ 'btn-danger': isDanger }"
          @click="emit('confirm')"
        >
          {{ confirmText || "Confirmar" }}
        </button>
      </div>
    </div>
  </div>
</template>
