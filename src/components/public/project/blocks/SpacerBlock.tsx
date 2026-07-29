import type { SpacerBlockPayload } from '@/lib/types/blocks'

export default function SpacerBlock({ payload }: { payload: { type: 'SPACER' } & SpacerBlockPayload }) {
  return <div style={{ height: `${payload.heightRem}rem` }} aria-hidden="true" />
}
