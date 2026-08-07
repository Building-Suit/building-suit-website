<template>
  <div class="bs-experience">
    <LandingArchitecturalAtmosphere />

    <div class="bs-experience__spacer bs-experience__spacer--top" aria-hidden="true" />

    <LandingBrandIdentity />

    <div class="bs-experience__bottom">
      <LandingFutureActionsSlot />
    </div>
  </div>
</template>

<style scoped>
.bs-experience {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  overflow: hidden;
  padding-inline: max(env(safe-area-inset-left), 24px) max(env(safe-area-inset-right), 24px);
  padding-block-start: max(env(safe-area-inset-top), 20px);
  padding-block-end: max(env(safe-area-inset-bottom), 20px);
  background: var(--bs-color-role-dark-background);
}

.bs-experience__spacer--top {
  flex: 0.9 0 0;
  min-height: 8px;
}

.bs-experience__bottom {
  flex: 1.5 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-block-start: clamp(1rem, 4dvh, 3rem);
}
</style>
