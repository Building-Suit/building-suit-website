<script setup lang="ts">
import { environmentReveal, parallaxMaxPx, parallaxSpring } from '~/utils/buildingSuitMotion'

const reducedMotion = useSafeReducedMotion()
const reveal = computed(() => environmentReveal(reducedMotion.value))

const pointerX = useMotionValue(0)
const pointerY = useMotionValue(0)
const springX = useSpring(pointerX, parallaxSpring)
const springY = useSpring(pointerY, parallaxSpring)

const planeOffsetX = useTransform(springX, [-1, 1], [-parallaxMaxPx, parallaxMaxPx])
const planeOffsetY = useTransform(springY, [-1, 1], [-parallaxMaxPx / 2, parallaxMaxPx / 2])
const glowOffsetX = useTransform(springX, [-1, 1], [parallaxMaxPx / 2, -parallaxMaxPx / 2])
const glowOffsetY = useTransform(springY, [-1, 1], [parallaxMaxPx / 3, -parallaxMaxPx / 3])

let cleanup: (() => void) | null = null

onMounted(() => {
  if (!import.meta.client) return
  const pointerFine = window.matchMedia('(pointer: fine)').matches
  if (!pointerFine || reducedMotion.value) return

  function onPointerMove(event: PointerEvent) {
    const nx = (event.clientX / window.innerWidth) * 2 - 1
    const ny = (event.clientY / window.innerHeight) * 2 - 1
    pointerX.set(nx)
    pointerY.set(ny)
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  cleanup = () => window.removeEventListener('pointermove', onPointerMove)
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <Motion as="div" class="bs-atmosphere" aria-hidden="true" v-bind="reveal">
    <div class="bs-atmosphere__base" />
    <div class="bs-atmosphere__navy-field" />

    <div class="bs-atmosphere__grid-wrap bs-atmosphere__grid-wrap--far">
      <Motion
        as="div"
        class="bs-atmosphere__grid bs-atmosphere__grid--far"
        :style="{ x: reducedMotion ? 0 : planeOffsetX, y: reducedMotion ? 0 : planeOffsetY }"
      />
    </div>
    <div class="bs-atmosphere__grid-wrap bs-atmosphere__grid-wrap--near">
      <Motion
        as="div"
        class="bs-atmosphere__grid bs-atmosphere__grid--near"
        :style="{ x: reducedMotion ? 0 : planeOffsetX, y: reducedMotion ? 0 : planeOffsetY }"
      />
    </div>

    <div class="bs-atmosphere__plane bs-atmosphere__plane--one" />
    <div class="bs-atmosphere__plane bs-atmosphere__plane--two" />

    <div class="bs-atmosphere__glow-wrap">
      <Motion
        as="div"
        class="bs-atmosphere__glow"
        :style="{ x: reducedMotion ? 0 : glowOffsetX, y: reducedMotion ? 0 : glowOffsetY }"
      />
    </div>

    <div class="bs-atmosphere__grain" />
  </Motion>
</template>

<style scoped>
.bs-atmosphere {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--bs-color-role-dark-background);
}

.bs-atmosphere__base {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--bs-color-neutral-900) 0%, var(--bs-color-role-dark-background) 60%);
}

.bs-atmosphere__navy-field {
  position: absolute;
  inset: -10%;
  background: radial-gradient(60% 50% at 50% 38%, var(--bs-color-brand-building-navy) 0%, transparent 72%);
  opacity: 0.55;
}

.bs-atmosphere__grid-wrap {
  position: absolute;
  inset: -20%;
  transform-origin: center;
  mask-image: radial-gradient(38% 34% at 50% 33%, transparent 0%, black 78%, black 100%);
  -webkit-mask-image: radial-gradient(38% 34% at 50% 33%, transparent 0%, black 78%, black 100%);
}

.bs-atmosphere__grid-wrap--far {
  transform: perspective(1400px) rotateX(6deg) rotateZ(-1deg) scale(1.15);
}

.bs-atmosphere__grid-wrap--near {
  transform: perspective(1400px) rotateX(-4deg) rotateZ(0.6deg) scale(1.08);
}

.bs-atmosphere__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--bs-color-brand-context-grid-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--bs-color-brand-context-grid-subtle) 1px, transparent 1px);
}

.bs-atmosphere__grid--far {
  background-size: 168px 168px;
  opacity: 0.32;
}

.bs-atmosphere__grid--near {
  background-image: linear-gradient(var(--bs-color-brand-context-grid-strong) 1px, transparent 1px),
    linear-gradient(90deg, var(--bs-color-brand-context-grid-strong) 1px, transparent 1px);
  background-size: 96px 96px;
  opacity: 0.18;
}

.bs-atmosphere__plane {
  position: absolute;
  border: 1px solid var(--bs-color-brand-context-boundary);
  border-radius: 2px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0));
}

.bs-atmosphere__plane--one {
  width: 40vmax;
  height: 58vmax;
  left: -20vmax;
  top: -16vmax;
  transform: rotate(-6deg);
  opacity: 0.4;
}

.bs-atmosphere__plane--two {
  width: 30vmax;
  height: 46vmax;
  right: -16vmax;
  bottom: -18vmax;
  transform: rotate(8deg);
  opacity: 0.28;
}

.bs-atmosphere__glow-wrap {
  position: absolute;
  width: min(30vmin, 300px);
  height: min(30vmin, 300px);
  left: 50%;
  top: 27%;
  transform: translate(-50%, -50%);
}

.bs-atmosphere__glow {
  position: absolute;
  inset: 0;
  border-radius: var(--bs-radius-full);
  background: radial-gradient(
    circle,
    rgba(216, 155, 66, 0.24) 0%,
    rgba(216, 155, 66, 0.1) 45%,
    rgba(216, 155, 66, 0) 78%
  );
}

.bs-atmosphere__grain {
  position: absolute;
  inset: 0;
  opacity: 0.025;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
