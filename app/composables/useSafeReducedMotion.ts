// motion-v's useReducedMotion() wraps @vueuse/core's useMediaQuery, which can resolve
// synchronously on the client during setup() — before Vue's hydration pass has run. If a
// component's `initial`/`animate` props branch on that value directly, the client's
// first render (which IS the hydration render) can disagree with what the server
// rendered (which has no way to know the OS's reduced-motion preference at all),
// producing a real Vue hydration mismatch.
//
// This wrapper always starts at `false` — matching what SSR renders — and only adopts
// the real value inside onMounted, which Vue guarantees runs after hydration completes.
// The correction is applied before paint in practice, so it does not reintroduce the
// "content stuck invisible" failure mode this same rule exists to prevent.
export function useSafeReducedMotion() {
  const source = useReducedMotion();
  const safe = ref(false);

  onMounted(() => {
    safe.value = source.value;
  });

  watch(source, (value) => {
    safe.value = value;
  });

  return safe;
}
