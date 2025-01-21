<script setup lang="ts">
import { ref } from 'vue';
import GameSetup from './components/gameSetup.vue';
import ScoreSheet from './components/scoreSheet.vue';
import { getTotalRounds } from './utils/database/rounds';
import { resetGame } from './utils/database/game';

const startGame = ref(false);

if (localStorage.getItem("phase10InProgress")) {
  startGame.value = true;
}

declare global {
    interface Window { resetGame: any; }
}

window.resetGame = resetGame || null;

getTotalRounds().then(total => {
  if (total > 0) {
    startGame.value = true;
    return;
  }
});
</script>

<template>
  <main class="container mx-auto py-10">
    <header class="prose mx-auto">
      <h1 class="text-center">Phase 10 Scoresheet</h1>
    </header>
    
    <ScoreSheet v-if="startGame" :startGame="startGame" />
    <GameSetup v-else :startGame="startGame" @startGame="(start) => startGame = start" />
  </main>
</template>