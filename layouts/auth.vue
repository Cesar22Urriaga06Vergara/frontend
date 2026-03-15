<template>
  <v-app>
    <v-main class="auth-background">
      <slot />
    </v-main>

    <!-- Snackbar global — Componente compartido -->
    <SharedGlobalSnackbar />
  </v-app>
</template>

<script setup lang="ts">
</script>
