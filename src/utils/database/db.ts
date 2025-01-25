import Dexie, { type EntityTable } from 'dexie';

type Player = {
	id: number;
	name: string;
	score: number; // player total score
	phase: number;
};

type Score = {
	player_id: number;
	name: string;
	score: number; // player round score
	phase: number; // if score = 0, phase + 1
};

type Round = {
	id: number;
	round: number;
	scores: Score[];
};

const db = new Dexie('phase10') as Dexie & {
	rounds: EntityTable<Round, 'id'>;
	players: EntityTable<Player, 'id'>;
};
db.version(1).stores({
	rounds: '++id, round, scores',
	players: '++id, name, score, phase'
});

export type { Score, Round, Player };
export { db };
