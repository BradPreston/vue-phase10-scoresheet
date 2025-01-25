<script setup lang="ts">
import type { Player, Score } from '@/utils/database/db';
import { getPlayerByName, getPlayers, updatePlayer } from '@/utils/database/player';
import { addRound, getTotalRounds } from '@/utils/database/rounds';
import { ref } from 'vue';

let modalVisible = ref(false);
let players = ref<Player[]>([]);
let round = ref(0);

getPlayers().then((p) => {
	players.value = p;
});

getTotalRounds().then((rounds) => (round.value = rounds));

async function handleAddRound() {
	round.value += 1;
	modalVisible.value = false;
	const form = document.getElementById('addRoundForm')! as HTMLFormElement;
	const formData = new FormData(form);
	const scores: Score[] = [];
	for (const key of formData.keys()) {
		const name = key.split('-')[0];
		const player = await getPlayerByName(name);
		if (!player) return;

		if (!scores.some((score) => score.player_id === player.id)) {
			await updatePlayer({
				id: player.id,
				score: player.score + Number(formData.get(`${name}-score`)),
				phase: formData.get(`${name}-made-phase`) ? player.phase + 1 : player.phase
			});

			scores.push({
				player_id: player.id,
				name: player.name,
				score: Number(formData.get(`${name}-score`)),
				phase: formData.get(`${name}-made-phase`) ? player.phase + 1 : player.phase
			});
		}
	}

	await addRound(round.value, scores);
}
</script>

<template>
	<button v-if="players" class="btn btn-secondary" @click.prevent="modalVisible = true">Add round data</button>

	<dialog :open="modalVisible" class="w-full h-screen z-50 fixed top-0 left-0 overflow-y-auto p-4">
		<h2 class="text-center">Enter the round scores</h2>
		<form @submit.prevent="handleAddRound" id="addRoundForm" class="flex flex-col justify-center">
			<ul class="flex flex-wrap list-none gap-4 justify-center pl-0">
				<li
					v-for="player of players"
					class="flex border-2 border-primary-content bg-secondary flex-col text-center p-4 pt-0 rounded min-w-10"
				>
					<div class="m-0 capitalize font-bold border-b-2 border-b-primary-content p-2">
						{{ player.name }}
					</div>
					<div class="m-0 flex flex-col mt-4 gap-4">
						<label class="label cursor-pointer justify-start gap-4">
							<label class="label-text" :for="player.id + '-score'">Score</label>
							<input
								required
								:id="player.id + '-score'"
								type="number"
								:name="player.name + '-score'"
								class="input input-bordered"
								value="0"
							/>
						</label>

						<label class="label cursor-pointer justify-start gap-4">
							<span class="label-text">Made phase</span>
							<input type="checkbox" class="checkbox border-primary-content" :name="player.name + '-made-phase'" />
						</label>
					</div>
				</li>
			</ul>
			<button type="submit" class="btn btn-secondary max-w-fit self-center">Add round</button>
		</form>
	</dialog>
</template>
