<script setup lang="ts">
import { type Player, type Round } from '@/utils/database/db';
import { resetGame } from '@/utils/database/game';
import { getPlayers } from '@/utils/database/player';
import { getRounds } from '@/utils/database/rounds';
import NewRoundModal from '@/components/modals/newRoundModal.vue';
import EditRoundModal from '@/components/modals/editRoundModal.vue';
import { useLiveQuery } from '@/utils/hooks/useLiveQuery';
import { ref } from 'vue';
import { useEditRoundIdStore } from '@/store';
const store = useEditRoundIdStore();

let isNewRoundModalOpen = ref(false);
let isEditRoundModalOpen = ref(false);

defineProps<{
	startGame: boolean;
}>();

function restartGame() {
	localStorage.removeItem('phase10InProgress');
	resetGame()
		.then(() => window.location.reload())
		.catch((err) => console.log(err));
}

function handleOpenEditModal(e: MouseEvent) {
	const target = e.target as HTMLButtonElement;
	const roundId = target.getAttribute('data-round-id');
	store.setId(Number(roundId));
	isEditRoundModalOpen.value = true;
}

const roundsFromDB = useLiveQuery<Round[]>(async () => await getRounds());

const playersFromDB = useLiveQuery<Player[]>(async () => await getPlayers());
</script>

<template>
	<section class="prose mx-auto mt-10 px-5" v-if="!startGame">
		<p class="text-center">Game not initialized...</p>
	</section>
	<section v-else class="prose mx-auto mt-10 px-5">
		<div>
			<button class="btn btn-primary" @click="restartGame">Reset game</button>
		</div>
		<h2>Score sheet</h2>

		<NewRoundModal v-if="isNewRoundModalOpen" @close="isNewRoundModalOpen = false" />
		<EditRoundModal v-if="isEditRoundModalOpen" @close="isEditRoundModalOpen = false" />
		<button class="btn btn-secondary" @click="isNewRoundModalOpen = true">Add round data</button>
		<div class="overflow-x-auto">
			<table class="table table-pin-rows">
				<thead>
					<tr>
						<th>Round</th>
						<th v-for="player in playersFromDB" :key="player.name" class="capitalize">
							{{ player.name }}
						</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="round in roundsFromDB" :key="round.id">
						<th>{{ round.round }}</th>
						<td v-for="result in round.scores" :key="result.name" class="whitespace-nowrap">
							<span class="inline-block w-4">{{ result.score }}</span
							><span class="inline-block px-2">|</span
							><span class="inline-block w-4">{{ result.phase <= 10 ? result.phase : 10 }}</span>
						</td>
						<th>
							<button class="btn btn-secondary btn-sm" :data-round-id="round.id" @click="handleOpenEditModal">
								Edit
							</button>
						</th>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<th>Score</th>
						<td v-for="player of playersFromDB" :key="player.id">
							<span class="inline-block w-4">{{ player.score }}</span
							><span class="inline-block px-2">|</span
							><span class="inline-block w-4">{{ player.phase <= 10 ? player.phase : 10 }}</span>
						</td>
						<th></th>
					</tr>
				</tfoot>
			</table>
		</div>
	</section>
</template>
