<script setup lang="ts">
import AppModal from './AppModal.vue';
import NewRound from '../forms/NewRound.vue';

const emit = defineEmits(['close', 'open']);

function closeModal() {
  emit('close');
}
</script>

<template>
  <AppModal @close="closeModal">
    <template #title>Add Round</template>
    <template #body>
      <NewRound @close="closeModal" />
    </template>
  </AppModal>
</template>