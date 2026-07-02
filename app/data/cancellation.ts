// Flexible-cancellation choice used by the base flexibility section.

export type CancelChoice = 'flexible' | 'nonrefundable' | null

export const cancellation = {
  deadline: 'Tot 23 mei 23:59',
  upgradeDelta: 15, // "-€15 per kamer" for non-refundable
}
