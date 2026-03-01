<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";

const isAuthenticated = ref(false);
const userEmail = ref("");
const isAuthReady = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isAuthenticated.value = true;
      userEmail.value = user.email || "";
    } else {
      isAuthenticated.value = false;
      userEmail.value = "";
    }
    isAuthReady.value = true;
  });
});
</script>

<template>
  <div v-if="!isAuthReady" class="loading-screen">
    <p>Carregando...</p>
  </div>

  <template v-else>
    <Login v-if="!isAuthenticated" />
    <Dashboard v-else :userEmail="userEmail" />
  </template>
</template>
