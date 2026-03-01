<script setup lang="ts">
import { ref } from "vue";
import { loginUser, registerUser } from "../services/authService";
import { eyeOpen, eyeClosed } from "../assets/icons/iconsSVG";

const emit = defineEmits(["login-success"]);

const isLoginMode = ref(true);
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const showPassword = ref(false);

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  errorMessage.value = "";
  email.value = "";
  password.value = "";
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Por favor, preencha todos os campos.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    if (isLoginMode.value) {
      await loginUser(email.value, password.value);
    } else {
      await registerUser(email.value, password.value);
    }
  } catch (error: any) {
    console.error("Erro retornado pelo Firebase:", error);

    if (error.code === "auth/email-already-in-use") {
      errorMessage.value = "Este e-mail já está em uso.";
    } else if (error.code === "auth/weak-password") {
      errorMessage.value = "A senha deve ter pelo menos 6 caracteres.";
    } else if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      errorMessage.value = "E-mail ou senha incorretos.";
    } else {
      errorMessage.value = isLoginMode.value
        ? "Erro ao tentar fazer login. Tente novamente mais tarde."
        : "Erro ao criar conta. Verifique a configuração do Firebase (E-mail/Senha ativado).";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <h1 class="logo">
          <span class="logo-blue">hype</span
          ><span class="logo-black">social</span>
        </h1>
        <p class="subtitle">
          {{ isLoginMode ? "Acesse sua conta" : "Crie sua conta para começar" }}
        </p>
      </div>

      <div class="login-card">
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="input-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="seu@email.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="input-group">
            <label for="password">Senha</label>
            <div class="password-wrapper">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                required
                :disabled="isLoading"
              />
              <span
                class="eye-icon"
                @click="togglePasswordVisibility"
                v-html="showPassword ? eyeClosed : eyeOpen"
              ></span>
            </div>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <template v-if="isLoading">Carregando...</template>
            <template v-else>{{
              isLoginMode ? "Entrar" : "Criar conta"
            }}</template>
          </button>
        </form>

        <div class="toggle-mode">
          <p v-if="isLoginMode">
            Não tem conta?
            <span @click="toggleMode" class="toggle-link">Cadastre-se</span>
          </p>
          <p v-else>
            Já tem conta?
            <span @click="toggleMode" class="toggle-link">Faça login</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
