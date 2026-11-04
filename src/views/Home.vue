<template>
  <div class="home">
    <section class="hero">
      <p class="eyebrow">NCAA tournament bracket builder</p>
      <h1 class="hero-title">A bracket with forty years of history behind every pick</h1>
      <p class="hero-sub">
        Buster simulates the whole field from the record of every tournament game since 1985, lets you give your team an edge, and tells you how it went when the real games are played.
      </p>
      <div class="hero-actions">
        <v-btn color="primary" size="large" to="/login">Get started</v-btn>
        <v-btn variant="outlined" color="secondary" size="large" to="/login">Log in</v-btn>
      </div>
    </section>

    <section class="features">
      <v-card class="feature">
        <v-icon color="primary" size="28">mdi-tournament</v-icon>
        <h4>Build and keep</h4>
        <p class="mb-0">Name a bracket, run the simulation, and keep every one you build. Download a PDF for the pool or the fridge.</p>
      </v-card>
      <v-card class="feature">
        <v-icon color="primary" size="28">mdi-chart-bell-curve</v-icon>
        <h4>Odds, not coin flips</h4>
        <p class="mb-0">Every matchup is weighted by the real seed-versus-seed record. A 1 seed against a 16 is close to a lock. An 8 against a 9 is close to even.</p>
      </v-card>
      <v-card class="feature">
        <v-icon color="primary" size="28">mdi-basketball</v-icon>
        <h4>Buster's take</h4>
        <p class="mb-0">After the games, see how many you called, which upsets you nailed, and a recap of what your bracket got right.</p>
      </v-card>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding: 24px 0 32px;
}

.hero {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.hero-title {
  font-size: clamp(40px, 6vw, 64px);
  line-height: 0.95;
}

.hero-sub {
  max-width: 600px;
  font-size: 16px;
  color: var(--bb-muted);
  margin: 0;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature {
  padding: 22px 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature p {
  font-size: 14px;
  color: var(--bb-muted);
}

@media (max-width: 900px) {
  .features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .home {
    gap: 36px;
    padding-top: 12px;
  }
}
</style>
