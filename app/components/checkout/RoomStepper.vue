<script setup lang="ts">
import type { Room } from '~/data/deal'

const props = defineProps<{ room: Room }>()
const emit = defineEmits<{ 'update:quantity': [value: number] }>()

function setQty(next: number) {
  emit('update:quantity', Math.max(0, Math.min(props.room.maxPeople, next)))
}

// 2 personen per kamer: schaalt mee met het aantal kamers.
const maxPersons = computed(
  () => Math.max(props.room.quantity, 1) * props.room.maxPeople,
)
</script>

<template>
  <div class="qty">
    <span class="qty__label t-body c-grey">Aantal kamers</span>
    <div class="stepper">
      <button class="stepper__btn" type="button" aria-label="Minder kamers" @click="setQty(room.quantity - 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
      </button>
      <span class="stepper__val">{{ room.quantity }}</span>
      <button class="stepper__btn" type="button" aria-label="Meer kamers" @click="setQty(room.quantity + 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
      </button>
    </div>
    <span class="qty__max t-body c-mgrey">
      Max.<br>{{ maxPersons }} personen
    </span>
  </div>
</template>

<style scoped>
.qty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.qty__label { white-space: nowrap; }
.qty__max { text-align: center; }
.stepper {
  display: inline-flex;
  align-items: center;
  gap: 16px;
}
.stepper__btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-via-black);
  color: var(--c-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;
}
.stepper__btn:hover { opacity: 0.85; }
.stepper__val {
  min-width: 20px;
  text-align: center;
  font-weight: var(--w-black);
  font-size: var(--t-body-lg);
}
</style>
