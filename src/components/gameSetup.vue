<script setup lang="ts">
import { ref } from 'vue';

type user = {
  name: string;
  id: number;
}

// each player gets an ID that increments from 0
let id = 0;

let error = ref(false);

const newUser = ref('');
const users = ref<user[]>([]);

function addUser() {
  if (playerAlreadyEntered()) {
    error.value = true;
    return;
  }
  users.value.push({ name: newUser.value, id: id++});
  newUser.value = '';
}

function removeUser(user: user) {
  users.value = users.value.filter((u) => u !== user);
}

function playerAlreadyEntered() {
  return users.value.some(({ name }) => name.toLocaleLowerCase() === newUser.value.toLowerCase());
}
</script>

<template>
  <section class="prose mx-auto mt-10 px-5">
    <h2 class="text-center">Enter your players</h2>
    <form id="addPlayerForm" class="flex gap-2 justify-center" @submit.prevent="addUser">
      <input v-model="newUser" required type="text" placeholder="Player name" class="input input-bordered w-full" @input="error = false">
      <button type="submit" class="btn btn-secondary">Add player</button>
    </form>
    <h3 v-if="users.length">Players</h3>
    <ul class="flex gap-2 flex-wrap pl-0">
      <li v-for="user in users" :key="user.id" class="badge badge-secondary badge-lg p-5 cursor-pointer text-base capitalize" @click="removeUser(user)">
        {{ user.name }}
        <span class="ml-2">&#10005;</span>
      </li>
    </ul>
    <div class="mt-10">
      <div v-if="users.length >= 2" class="text-center mx-auto">
        <p>Ready to start?</p>
        <button class="btn btn-primary btn-wide">Start game</button>
      </div>
      <p v-else class="text-center">To begin the game, add at least 2 players</p>
    </div>

    <div v-if="error" role="alert" class="alert alert-error mt-10 text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span><span class="capitalize">{{ newUser }}</span> is already in the game</span>
      <div>
        <button class="btn btn-sm" @click="error = false">Accept</button>
      </div>
    </div>
  </section>
</template>