<script setup lang="ts">
import type { Round, Player, Score } from '@/utils/database/db';
import { getPlayerByName, updatePlayer } from '@/utils/database/player';
import { updateRound, getRound } from '@/utils/database/rounds';
import { ref } from 'vue';
import { useEditRoundIdStore } from '@/store';
const store = useEditRoundIdStore();

let error = ref(false);
let round = ref<Round>();

const emits = defineEmits(['close']);

getRound(store.id).then((r) => {
	if (r) {
		round.value = r;
	}
});

async function handleEditRound() {
	const form = document.getElementById('editRoundForm')! as HTMLFormElement;
	const formData = new FormData(form);

	const validRound = Array.from(formData.values()).some((value) => Number(value) === 0);
	if (!validRound) {
		error.value = true;
		return;
	}

	const scores: Score[] = [];
	const gameOver: Player[] = [];
	for (const key of formData.keys()) {
		const name = key.split('-')[0];
		const player = await getPlayerByName(name);
		if (!player) return;

		if (!scores.some((score) => score.player_id === player.id)) {
			if (formData.get(`${name}-made-phase`)) {
				if (player.phase + 1 >= 11) gameOver.push(player);
			}

			// await updatePlayer({
			// 	id: player.id,
			// 	score: player.score + Number(formData.get(`${name}-score`)),
			// 	phase: formData.get(`${name}-made-phase`) ? player.phase + 1 : player.phase
			// });

			scores.push({
				player_id: player.id,
				name: player.name,
				score: Number(formData.get(`${name}-score`)),
				phase: formData.get(`${name}-made-phase`) ? player.phase + 1 : player.phase,
				made_phase: formData.get(`${name}-made-phase`) ? true : false
			});
		}
	}

	if (gameOver.length > 0) {
		alert('Game over!');
		document.getElementById('editRoundButton')!.style.display = 'none';
	}

	console.log(scores);

	// await updateRound(round.value);
	// form.reset();
	// emits('close');
}
</script>

<template>
	<form @submit.prevent="handleEditRound" id="editRoundForm" class="flex flex-col justify-center">
		<ul class="flex flex-wrap list-none gap-4 justify-center pl-0">
			<li
				v-for="score of round?.scores"
				class="flex border-2 border-primary-content bg-secondary flex-col text-center p-4 pt-0 rounded min-w-10"
			>
				<div class="m-0 capitalize font-bold border-b-2 border-b-primary-content p-2">
					{{ score.name }}
				</div>
				<div class="m-0 flex flex-col mt-4 gap-4">
					<label class="label cursor-pointer justify-start gap-4">
						<label class="label-text" :for="score.player_id + '-score'">Score</label>
						<input
							required
							:id="score.player_id + '-score'"
							type="number"
							:name="score.name + '-score'"
							class="input input-bordered"
							placeholder="Score"
							:value="score.score"
						/>
					</label>

					<label class="label cursor-pointer justify-start gap-4">
						<span class="label-text">Made phase</span>
						<input
							type="checkbox"
							class="checkbox border-primary-content"
							:checked="score.made_phase"
							:name="score.name + '-made-phase'"
						/>
					</label>
				</div>
			</li>
		</ul>
		<button type="submit" class="btn btn-secondary max-w-fit self-center mt-5">edit round</button>
	</form>
	<div v-if="error" role="alert" class="alert alert-error mt-10 sticky bottom-0 text-white">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>At least one player must have a score of 0.</span>
		<div>
			<button class="btn btn-sm" @click="error = false">Accept</button>
		</div>
	</div>
</template>
