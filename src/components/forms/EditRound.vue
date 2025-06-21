<script setup lang="ts">
import type { Round, Player, Score } from '@/utils/database/db';
import { getPlayerByName, updatePlayer } from '@/utils/database/player';
import { updateRound, getRound } from '@/utils/database/rounds';
import { ref } from 'vue';
import { useEditRoundIdStore } from '@/store';

const store = useEditRoundIdStore();
const emits = defineEmits(['close']);

let error = ref(false);
let round = ref<Round>();
let initialScores = ref<Score[]>();
let playerTotalScores = ref<Player[]>([]);

type KeyValuePair = [string, FormDataEntryValue];
type GroupedResult = Record<string, Record<string, FormDataEntryValue>>;
type UpdatePhase = {
	previousPhase: number;
	previousMadePhase: boolean;
	currentMadePhase: boolean;
};

getRound(store.id).then((r) => {
	if (r) {
		initialScores.value = r.scores;
		round.value = r;

		r.scores.forEach(async (score) => {
			const player = await getPlayerByName(score.name);
			if (player) {
				playerTotalScores.value.push(player);
			}
		});
	}
});

function getNameFromKey(value: string) {
	return value.split('-')[0];
}

function groupByName(pairs: KeyValuePair[]): GroupedResult {
	const grouped: GroupedResult = {};

	for (const [key, value] of pairs) {
		const groupKey = getNameFromKey(key);

		if (!grouped[groupKey]) {
			grouped[groupKey] = {};
		}

		grouped[groupKey][key] = value;
	}

	return grouped;
}

function isRoundValid(pairs: KeyValuePair[]): boolean {
	const grouped = groupByName(pairs);

	for (const group of Object.values(grouped)) {
		const hasZeroScore = Object.entries(group).some(([key, value]) => key.endsWith('score') && value === '0');

		const hasMadePhaseOn = Object.entries(group).some(([key, value]) => key.endsWith('made-phase') && value === 'on');

		if (hasZeroScore && hasMadePhaseOn) return true;
	}

	return false;
}

async function getScoresFromForm(formData: FormData): Promise<Score[]> {
	const scores: Score[] = [];
	for (const key of formData.keys()) {
		const name = getNameFromKey(key);
		const player = await getPlayerByName(name);
		if (!player) continue;
		if (!key.endsWith('score')) continue;
		scores.push({
			player_id: player.id,
			name: player.name,
			score: Number(formData.get(`${name}-score`)),
			phase: player.phase,
			made_phase: formData.get(`${name}-made-phase`) ? true : false
		});
	}
	return scores;
}

function getUpdatedScores(
	scoresFromForm: Score[],
	scoresFromDB: Score[]
): { updatedScores: Score[]; allScores: Score[] } {
	const updatedScores: Score[] = [];
	const allScores: Score[] = [];

	for (const scoreFromForm of scoresFromForm) {
		allScores.push(scoreFromForm);
		const scoreFromDB = scoresFromDB.filter((score) => score.player_id === scoreFromForm.player_id)[0];
		if (scoreFromForm.score !== scoreFromDB.score || scoreFromForm.made_phase !== scoreFromDB.made_phase) {
			updatedScores.push(scoreFromForm);
		}
	}

	return {
		updatedScores,
		allScores
	};
}

function updatePhase({ previousPhase, previousMadePhase, currentMadePhase }: UpdatePhase) {
	if (!previousMadePhase && currentMadePhase) return previousPhase + 1;
	if (previousMadePhase && !currentMadePhase) return previousPhase - 1;
	return previousPhase;
}

async function handleEditRound() {
	if (!round.value || !initialScores.value || !playerTotalScores.value) return;

	const form = document.getElementById('editRoundForm') as HTMLFormElement;
	const formData = new FormData(form);
	const formDataEntries = Array.from(formData.entries());
	const validRound = isRoundValid(formDataEntries);

	if (!validRound) {
		error.value = true;
		return;
	}

	const scores = await getScoresFromForm(formData);
	const { updatedScores } = getUpdatedScores(scores, round.value.scores);

	for (const updatedScore of updatedScores) {
		const player = playerTotalScores.value.filter((p) => p.id === updatedScore.player_id)[0];
		const previousScore = initialScores.value.filter((s) => s.player_id === updatedScore.player_id)[0];
		if (!player || !previousScore) return;

		const scoreDifference = updatedScore.score - previousScore.score; // add to previous score
		const updatedPhase = updatePhase({
			previousPhase: previousScore.phase,
			currentMadePhase: updatedScore.made_phase,
			previousMadePhase: previousScore.made_phase
		});

		await updatePlayer({
			id: player.id,
			score: player.score + scoreDifference,
			phase: updatedPhase
		});
	}

	const updatedRound = { ...round.value, scores }

	updateRound(updatedRound)

	form.reset();
	emits('close');
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
							autocomplete="off"
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
		<span>At least one player must have a score of 0 and made their phase.</span>
		<div>
			<button class="btn btn-sm" @click="error = false">Accept</button>
		</div>
	</div>
</template>
