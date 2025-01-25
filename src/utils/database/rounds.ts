import { db, type Round, type Score } from './db';

export async function addRound(round: number, scores: Score[]) {
	return await db.rounds.add({ round, scores });
}

export async function getRounds() {
	const rounds: Round[] = [];
	await db.rounds.each((round: Round) => rounds.push(round));
	return rounds;
}

export async function getRound(id: number) {
	return await db.rounds.get(id);
}

export async function getTotalRounds() {
	return await db.rounds.count();
}

export async function updateRound(round: Round) {
	return await db.rounds.update(round.id, {
		round: round.round,
		scores: round.scores
	});
}

export async function deleteRound(id: number) {
	await db.rounds.delete(id);
}
