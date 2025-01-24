<script setup lang="ts">
import { type Player, type Round } from '@/utils/database/db';
import { resetGame } from '@/utils/database/game';
import { getPlayerByName, getPlayers, updatePlayer } from '@/utils/database/player';
import { addRound, getRounds, getTotalRounds } from '@/utils/database/rounds';
import NewRoundModal from '@/components/newRoundModal.vue';
import { ref } from 'vue';

defineProps<{
  startGame: boolean;
}>();

function restartGame() {
  localStorage.removeItem("phase10InProgress");
  resetGame().then(() => window.location.reload()).catch(err => console.log(err));
}

function getSam() {
  getPlayerByName('sam').then(console.log).catch(err => console.log(err))
}

let allRounds = ref<Round[]>();
let allPlayers = ref<Player[]>();

async function updateScore() {
  const dad = await getPlayerByName('dad');
  const brad = await getPlayerByName('brad');
  const sam = await getPlayerByName('sam');

  if (!dad || !brad || !sam) return;

  // replace with loop
  updatePlayer({
    id: brad.id,
    score: brad.score + 35,
    phase: brad.phase
  });

  updatePlayer({
    id: dad.id,
    score: dad.score + 65,
    phase: dad.phase
  });

  updatePlayer({
    id: sam.id,
    score: sam.score,
    phase: sam.phase + 1
  });

  await addRound(
    await getTotalRounds(),
    [
      {
        player_id: brad.id,
        name: brad.name,
        score: 35,
        phase: brad.phase
      },
      {
        player_id: dad.id,
        name: dad.name,
        score: 65,
        phase: dad.phase
      },
      {
        player_id: sam.id,
        name: sam.name,
        score: 0,
        phase: sam.phase + 1
      }
  ]
    )
}

async function logRounds() {
  const rounds = await getRounds();
  console.log(rounds);
  rounds.forEach(round => allRounds.value?.push(round));
  return rounds;
}

getPlayers().then(players => players.forEach(player => allPlayers.value?.push(player)));

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

    <div class="overflow-x-auto">
      <NewRoundModal />
      <button class="btn btn-secondary" @click.prevent="getSam">Get sam</button>
      <button class="btn btn-secondary" @click.prevent="logRounds">Log rounds</button>
      <button class="btn btn-secondary" @click.prevent="updateScore">Update Game State</button>
      <table class="table table-pin-rows table-pin-cols">
    <thead>
      <tr>
        <th>Round</th>
        <th v-for="player in allPlayers" :key="player.name" class="capitalize">{{ player.name }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="round in allRounds" :key="round.id">
        <th>{{ round.round }}</th>
        <td v-for="result in round.scores" :key="result.name"><span class="inline-block w-4">{{ result.score }}</span><span class="inline-block px-2">|</span><span class="inline-block w-4">{{ result.phase }}</span></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th>Score</th>
        <td v-for="player of allPlayers">
          <span class="inline-block w-4">{{ player.score }}</span><span class="inline-block px-2">|</span><span class="inline-block w-4">{{ player.phase }}</span>
        </td>
      </tr>
    </tfoot>
  </table>
</div>
  </section>
</template>