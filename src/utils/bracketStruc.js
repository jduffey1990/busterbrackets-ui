// src/utils/bracketStruc.js
//
// ─── REMOVED: bracketNames and bracketFinalYears ───
// Team names and tournament results are now fetched from the backend's
// tournamentData collection via the API. See Admin.vue for management.
//
// ─── KEPT: Odds data and starting bracket arrays ───

export const recordsOver20 = {
  // Real historical odds
  "1vs16": "154-2",
  "8vs9": "75-81",
  "5vs12": "101-55",
  "4vs13": "123-33",
  "6vs11": "95-61",
  "3vs14": "133-23",
  "7vs10": "95-61",
  "2vs15": "145-11",
  "1vs8": "61-17",
  "4vs5": "47-36",
  "3vs6": "48-31",
  "2vs7": "63-27",
  "1vs4": "49-20",
  "2vs3": "37-24",
  "1vs2": "38-30",
  "1vs9": "74-6",
  "3vs11": "36-20",
  "1vs5": "43-11",
  "2vs11": "16-4",
  "5vs13": "18-3",
  "4vs12": "30-13",
  "1vs12": "20-0",
  "1vs3": "23-14",
  "2vs10": "36-19",
  "2vs6": "24-8",
  // Even odds for same-seed matchups (cross-region in finals)
  "1vs1": "10-10",
  "2vs2": "10-10",
  "3vs3": "10-10",
  "4vs4": "10-10",
  "5vs5": "10-10",
  "6vs6": "10-10",
  "7vs7": "10-10",
  "8vs8": "10-10",
  "9vs9": "10-10",
  "10vs10": "10-10",
  "11vs11": "10-10",
  "12vs12": "10-10",
  "13vs13": "10-10",
  "14vs14": "10-10",
  "15vs15": "10-10",
  "16vs16": "10-10",
};

export const fixRecords = (obj) => {
  const records = new Map();
  for (const key in obj) {
    const [winsStr, lossesStr] = obj[key].split("-");
    const wins = parseFloat(winsStr);
    const losses = parseFloat(lossesStr);
    const total = wins + losses;
    if (!total) continue;
    const percentage = Math.round((wins / total) * 100);
    records.set(key, percentage);
  }
  return records;
};

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