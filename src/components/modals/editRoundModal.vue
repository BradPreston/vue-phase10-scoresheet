<script setup lang="ts">
import AppModal from './AppModal.vue';
import EditRound from '../forms/EditRound.vue';
const emit = defineEmits(['close']);

function closeModal() {
	emit('close');
}
</script>

<template>
	<AppModal @close="closeModal">
		<template #title>Edit Round</template>
		<template #body>
			<EditRound @close="closeModal" />
		</template>
	</AppModal>
</template>
