<script setup lang="ts">
import { type Player } from '@/utils/database/db';
import { addPlayer, deletePlayer, getPlayer, getPlayerByName, getTotalPlayers } from '@/utils/database/player';
import { ref } from 'vue';

defineProps<{
	startGame: false;
}>();

const emit = defineEmits(['startGame']);

let error = ref(false);

const newPlayer = ref('');
const totalPlayers = ref(0);

const players = ref<Player[]>([]);

getTotalPlayers().then((val) => (totalPlayers.value = val));

async function addNewPlayer() {
	if (await playerAlreadyEntered()) {
		error.value = true;
		return;
	}

	const newPlayerId = await addPlayer(newPlayer.value);
	if (!newPlayerId) return;

	const player = await getPlayer(newPlayerId);
	if (!player) return;

	players.value.push(player);
	newPlayer.value = '';
}

async function playerAlreadyEntered() {
	const player = await getPlayerByName(newPlayer.value);
	return player ? true : false;
}

function handleStartGame() {
	emit('startGame', true);
	localStorage.setItem('phase10InProgress', JSON.stringify(true));
}
</script>

<template>
	<section class="prose mx-auto mt-10 px-5" v-if="startGame">
		<p class="text-center">Game is not initialized...</p>
	</section>
	<section class="prose mx-auto mt-10 px-5" v-else>
		<h2 class="text-center">Enter your players</h2>
		<form id="addPlayerForm" class="flex gap-2 justify-center" @submit.prevent="addNewPlayer">
			<input
				v-model="newPlayer"
				required
				type="text"
				placeholder="Player name"
				class="input input-bordered w-full"
				@input="error = false"
			/>
			<button type="submit" class="btn btn-secondary">Add player</button>
		</form>
		<h3 v-if="totalPlayers > 2">Players</h3>
		<ul class="flex gap-2 flex-wrap pl-0">
			<li
				v-for="player in players"
				:key="player.id"
				class="badge badge-secondary badge-lg p-5 cursor-pointer text-base capitalize"
				@click="deletePlayer(player.id)"
			>
				{{ player.name }}
				<span class="ml-2">&#10005;</span>
			</li>
		</ul>
		<div class="mt-10">
			<div v-if="players.length >= 2" class="text-center mx-auto">
				<p>Ready to start?</p>
				<button class="btn btn-primary btn-wide" @click="handleStartGame">Start game</button>
			</div>
			<p v-else class="text-center">To begin the game, add at least 2 players</p>
		</div>

		<div v-if="error" role="alert" class="alert alert-error mt-10 text-white">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span
				><span class="capitalize">{{ newPlayer }}</span> is already in the game</span
			>
			<div>
				<button class="btn btn-sm" @click="error = false">Accept</button>
			</div>
		</div>
	</section>
</template>
