// src/utils/bracketStruc.js
//
// ─── REMOVED: bracketNames and bracketFinalYears ───
// Team names and tournament results are now fetched from the backend's
// tournamentData collection via the API. See Admin.vue for management.
//
// ─── REMOVED: recordsOver20 and fixRecords ───
// The odds table and the simulation live in the brackets service
// (GET /odds, POST /simulate-bracket). This file keeps the bracket shape only.

// ─── Starting bracket arrays (bracket-order for round of 64) ───
// These represent the standard 1v16, 8v9, 5v12, 4v13 ... matchup order.

export const startingBracketEast = [
  "e1", "e16", "e8", "e9", "e5", "e12", "e4", "e13",
  "e6", "e11", "e3", "e14", "e7", "e10", "e2", "e15"
];
export const startingBracketWest = [
  "w1", "w16", "w8", "w9", "w5", "w12", "w4", "w13",
  "w6", "w11", "w3", "w14", "w7", "w10", "w2", "w15"
];
export const startingBracketMidwest = [
  "m1", "m16", "m8", "m9", "m5", "m12", "m4", "m13",
  "m6", "m11", "m3", "m14", "m7", "m10", "m2", "m15"
];
export const startingBracketSouth = [
  "s1", "s16", "s8", "s9", "s5", "s12", "s4", "s13",
  "s6", "s11", "s3", "s14", "s7", "s10", "s2", "s15"
];

// ─── Generic base names (fallback when no tournament data is loaded) ───

export const baseTeamNames = (() => {
  const names = {};
  const regions = { e: "East", w: "West", m: "Midwest", s: "South" };
  for (const [prefix, regionName] of Object.entries(regions)) {
    for (let seed = 1; seed <= 16; seed++) {
      names[`${prefix}${seed}`] = `${regionName} ${seed} Seed`;
    }
  }
  return names;
})();

// ─── Helpers for working with structured brackets ───

/**
 * Convert a StructuredBracket back into the display arrays needed by Bracket.vue.
 * Returns { east, west, south, midwest } where each is:
 *   startingSeeds(16) + round32(8) + sweet16(4) + elite8(2) = 30 entries
 * Plus { semifinals, champion }.
 */
export function structuredToDisplay(bracket) {
  const regions = {
    east: {
      starting: startingBracketEast,
      data: bracket.east,
    },
    west: {
      starting: startingBracketWest,
      data: bracket.west,
    },
    south: {
      starting: startingBracketSouth,
      data: bracket.south,
    },
    midwest: {
      starting: startingBracketMidwest,
      data: bracket.midwest,
    },
  };

  const display = {};
  for (const [name, { starting, data }] of Object.entries(regions)) {
    display[name] = [
      ...starting,
      ...data.round32,
      ...data.sweet16,
      ...data.elite8,
    ];
  }

  return {
    ...display,
    semifinals: [
      bracket.east.regionChamp,
      bracket.midwest.regionChamp,
      bracket.south.regionChamp,
      bracket.west.regionChamp,
      ...bracket.finals.semifinals,
    ],
    champion: bracket.finals.champion,
  };
}

/**
 * Build a "base" (all-favorites) StructuredBracket for comparison.
 * Each round the lower seed (favorite) wins.
 */
export function buildBaseBracket() {
  function buildRegion(prefix) {
    // R64 matchups in bracket order: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    const round32 = [1, 8, 5, 4, 6, 3, 7, 2].map(s => `${prefix}${s}`);
    // S16: 1v8→1, 5v4→4, 6v3→3, 7v2→2
    const sweet16 = [1, 4, 3, 2].map(s => `${prefix}${s}`);
    // E8: 1v4→1, 3v2→2
    const elite8 = [1, 2].map(s => `${prefix}${s}`);
    const regionChamp = `${prefix}1`;
    return { round32, sweet16, elite8, regionChamp };
  }

  return {
    east: buildRegion('e'),
    midwest: buildRegion('m'),
    south: buildRegion('s'),
    west: buildRegion('w'),
    finals: {
      teams: ["e1", "m1", "s1", "w1"],
      semifinals: ["e1", "s1"],
      champion: "e1",
    },
  };
}

/**
 * Format a seed string like "e3" into "3. Wisconsin" (or "3. East 3 Seed" as fallback).
 */
export function formatTeamDisplay(seedString, teamNames) {
  const seed = seedString.slice(1);
  const name = teamNames?.[seedString] || baseTeamNames[seedString] || seedString;
  return `${seed}. ${name}`;
}

/**
 * Format just the team name (no seed number prefix).
 */
export function formatTeamTitle(seedString, teamNames) {
  return teamNames?.[seedString] || baseTeamNames[seedString] || seedString;
}

/**
 * Compare two structured brackets and return stats.
 */
export function compareBrackets(official, user) {
  let correctPicks = 0;
  let totalGames = 0;
  const upsets = [];

  const regions = ['east', 'midwest', 'south', 'west'];
  const rounds = ['round32', 'sweet16', 'elite8'];

  for (const region of regions) {
    for (const round of rounds) {
      const officialRound = official[region][round];
      const userRound = user[region][round];
      const len = Math.min(officialRound.length, userRound.length);
      for (let i = 0; i < len; i++) {
        totalGames++;
        if (officialRound[i] === userRound[i]) {
          correctPicks++;
        } else {
          const officialSeed = parseInt(officialRound[i].replace(/\D/g, ''));
          const userSeed = parseInt(userRound[i].replace(/\D/g, ''));
          if (userSeed > officialSeed) {
            upsets.push(userRound[i]);
          }
        }
      }
    }

    // Region champ
    totalGames++;
    if (official[region].regionChamp === user[region].regionChamp) {
      correctPicks++;
    }
  }

  // Finals
  for (let i = 0; i < official.finals.semifinals.length; i++) {
    totalGames++;
    if (official.finals.semifinals[i] === user.finals.semifinals[i]) {
      correctPicks++;
    } else {
      const officialSeed = parseInt(official.finals.semifinals[i].replace(/\D/g, ''));
      const userSeed = parseInt(user.finals.semifinals[i].replace(/\D/g, ''));
      if (userSeed > officialSeed) {
        upsets.push(user.finals.semifinals[i]);
      }
    }
  }

  // Champion
  totalGames++;
  if (official.finals.champion === user.finals.champion) {
    correctPicks++;
  }

  return { correctPicks, totalGames, upsets };
}