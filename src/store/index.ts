import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditRoundIdStore = defineStore('roundId', () => {
	const id = ref(0);

	function setId(newId: number) {
		id.value = newId;
	}

	return { id, setId };
});
