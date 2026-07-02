<script setup lang="ts">
import { pageVariants, defaultVariant } from '~/data/pageVariants'

const route = useRoute()
const router = useRouter()

const open = ref(true)
const activeKey = computed(() => {
  const q = route.query.variant
  const key = Array.isArray(q) ? q[0] : q
  const match = pageVariants.find((v) => v.key === key)
  if (match) return match.key
  // No/unknown query: infer from the route path (e.g. /home = flexonly)
  const byPath = pageVariants.find((v) => v.path && route.path === v.path)
  return byPath ? byPath.key : defaultVariant
})

function select(key: string) {
  const v = pageVariants.find((x) => x.key === key)
  router.push({ path: v?.path ?? '/', query: { variant: key } })
}
</script>

<template>
  <div class="switcher">
    <button class="switcher__toggle" type="button" @click="open = !open">
      <span>Variant</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :style="{ transform: open ? 'rotate(180deg)' : 'none' }">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div v-show="open" class="switcher__list">
      <button
        v-for="v in pageVariants"
        :key="v.key"
        type="button"
        class="switcher__item"
        :class="{ 'switcher__item--on': v.key === activeKey }"
        @click="select(v.key)"
      >
        {{ v.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.switcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 50;
  width: 300px;
  background: var(--c-via-black);
  color: var(--c-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  font-size: var(--t-body);
}
.switcher__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  color: var(--c-white);
  font-weight: var(--w-black);
}
.switcher__toggle svg { transition: transform 0.15s ease; }
.switcher__list {
  display: flex;
  flex-direction: column;
  padding: 4px;
  gap: 2px;
}
.switcher__item {
  text-align: left;
  color: var(--c-white);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.12s ease;
}
.switcher__item:hover { background: rgba(255, 255, 255, 0.1); }
.switcher__item--on { background: var(--c-via-orange); }
</style>
