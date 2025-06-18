<script setup lang="ts">
const emit = defineEmits(['close'])

function closeModal() {
  emit('close');
}
</script>

<template>
	<Teleport to="body">
		<dialog open id="modal" class="modal" @click="closeModal">
			<div class="modal-box" @click.stop>
				<h3 class="text-lg font-bold text-center mb-5 relative">
					<button @click="closeModal" class="btn btn-sm btn-secondary btn-square absolute right-0 top-0 text-lg">&#10005;</button>
					<slot name="title" />
				</h3>
				<slot name="body" />
			</div>
		</dialog>
	</Teleport>
</template>
