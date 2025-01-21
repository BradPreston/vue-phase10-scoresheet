import { db, type Player } from './db';

export async function addPlayer(name: string) {
  return await db.players.add({
    name: name,
    phase: 1,
    score: 0
  });
}

export async function getPlayers() {
  const players: Player[] = [];
  await db.players.each((player: Player) => players.push(player));
  return players;
}

export async function getPlayer(id: number) {
  return await db.players.get(id);
}

export async function getTotalPlayers() {
  return await db.players.count();
}

export async function getPlayerByName(name: string) {
  return await db.players.filter(player => player.name === name).first();
}

export async function updatePlayer({ id, phase, score }: { id: number, phase: number, score: number }) {
  return await db.players.update(id, { phase, score });
}

export async function deletePlayer(id: number) {
  await db.players.delete(id);
}