<script setup lang="ts">
import { type Player, type Round } from '@/utils/database/db';
import { resetGame } from '@/utils/database/game';
import { getPlayers } from '@/utils/database/player';
import { getRounds } from '@/utils/database/rounds';
import NewRoundModal from '@/components/newRoundModal.vue';
import { useLiveQuery } from '@/utils/hooks/useLiveQuery';

defineProps<{
  startGame: boolean;
}>();

function restartGame() {
  localStorage.removeItem("phase10InProgress");
  resetGame().then(() => window.location.reload()).catch(err => console.log(err));
}

const roundsFromDB = useLiveQuery<Round[]>(
  async () => await getRounds()
)

const playersFromDB = useLiveQuery<Player[]>(
  async () => await getPlayers()
)
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
      <table class="table table-pin-rows table-pin-cols">
    <thead>
      <tr>
        <th>Round</th>
        <th v-for="player in playersFromDB" :key="player.name" class="capitalize">{{ player.name }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="round in roundsFromDB" :key="round.id">
        <th>{{ round.round }}</th>
        <td v-for="result in round.scores" :key="result.name"><span class="inline-block w-4">{{ result.score }}</span><span class="inline-block px-2">|</span><span class="inline-block w-4">{{ result.phase }}</span></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th>Score</th>
        <td v-for="player of playersFromDB" :key="player.id">
          <span class="inline-block w-4">{{ player.score }}</span><span class="inline-block px-2">|</span><span class="inline-block w-4">{{ player.phase }}</span>
        </td>
      </tr>
    </tfoot>
  </table>
</div>
  </section>
</template>