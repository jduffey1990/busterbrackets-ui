<template>
  <div class="team-row" :class="[`is-${state}`, { dense, upset, champ, 'top-seed': topSeed }]">
    <span class="seed">{{ seedNumber }}</span>
    <span class="name">{{ name }}</span>
    <span v-if="upset" class="tag">Upset</span>
    <v-icon v-if="champ" size="18" class="trophy">mdi-trophy</v-icon>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// One team in one game. `state` is what happened to this team in this game:
// win (advanced), out (eliminated), tbd (slot not filled yet).
const props = defineProps({
  seedKey: { type: String, default: '' },   // "e1", "m12"
  name: { type: String, default: 'TBD' },
  state: { type: String, default: 'tbd' },
  upset: { type: Boolean, default: false },  // this team won as the worse seed
  champ: { type: Boolean, default: false },  // the champion banner variant
  dense: { type: Boolean, default: false },  // the 24px rows of the full-field grid
})

const seedNumber = computed(() => (props.seedKey ? props.seedKey.slice(1) : ''))
const topSeed = computed(() => props.state === 'win' && Number(seedNumber.value) <= 4)
</script>

<style scoped>
.team-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  min-width: 0;
  padding: 0 8px;
  border-radius: 6px;
  border-left: 3px solid transparent;
  background: var(--bb-raised);
  color: var(--bb-muted);
  font-size: 14px;
}

.dense {
  height: 24px;
  gap: 6px;
  padding: 0 6px;
  border-radius: 5px;
  font-size: 12px;
}

.is-win {
  color: var(--bb-paper);
  font-weight: 600;
  border-left-color: var(--bb-ball);
}

.is-win.upset {
  border-left-color: var(--bb-gold);
}

.seed {
  flex: 0 0 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: var(--bb-paper);
  font-family: var(--bb-font-display);
  font-weight: 800;
  font-size: 13px;
}

.dense .seed {
  flex-basis: 18px;
  height: 18px;
  border-radius: 4px;
  font-size: 11px;
}

.top-seed .seed {
  background: var(--bb-ball);
  color: var(--bb-court);
}

.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag {
  padding: 2px 6px;
  border-radius: 3px;
  background: var(--bb-gold);
  color: var(--bb-court);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.dense .tag {
  padding: 1px 5px;
  font-size: 9px;
}

.champ {
  height: 48px;
  padding: 0 12px;
  border-radius: 8px;
  border-left: 0;
  background: var(--bb-ball);
  color: var(--bb-court);
  font-family: var(--bb-font-display);
  font-weight: 800;
  font-size: 22px;
  text-transform: uppercase;
}

.champ .seed {
  background: rgba(11, 21, 38, 0.18);
  color: var(--bb-court);
}

.champ .trophy {
  margin-left: auto;
}
</style>
