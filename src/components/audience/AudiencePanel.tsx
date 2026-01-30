import React, { useMemo } from 'react'
import { AudienceMember } from '@/types'

function getSeatGridCols(seatCount: number): number {
  if (seatCount <= 1) return 1
  if (seatCount <= 4) return 2
  if (seatCount <= 9) return 3
  return 4
}

function getSeatNameClass(cols: number): string {
  if (cols <= 2) return 'text-xl'
  if (cols === 3) return 'text-base'
  return 'text-sm'
}

export const AudiencePanel: React.FC<{ members: AudienceMember[] }> = ({ members }) => {
  const cols = useMemo(() => getSeatGridCols(members.length), [members.length])
  const nameClass = useMemo(() => getSeatNameClass(cols), [cols])

  return (
    <aside
      className="h-full overflow-hidden rounded-3xl border-2 border-amber-300/80
                 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,0.26),transparent_58%),radial-gradient(circle_at_90%_20%,rgba(245,158,11,0.20),transparent_55%),linear-gradient(to_bottom,rgba(255,251,235,0.92),rgba(255,255,255,0.88))]
                 shadow-[0_24px_60px_-40px_rgba(245,158,11,0.75)]"
      aria-label="观众席"
    >
      <div className="h-full p-3">
        <div className="h-full w-full flex items-center justify-center">
          <div
            className="w-full max-w-full grid gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {members.map((m) => (
              (() => {
                const isVip = m.vip === true
                const seatClass = isVip
                  ? `aspect-square w-full rounded-full border-2 border-amber-400/90
                     bg-gradient-to-br from-amber-300 via-amber-100 to-white
                     ring-2 ring-amber-300/40
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_28px_-18px_rgba(245,158,11,1)]
                     flex items-center justify-center text-center`
                  : `aspect-square w-full rounded-full border border-amber-200/80
                     bg-gradient-to-br from-amber-200 via-amber-50 to-white
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_16px_24px_-18px_rgba(245,158,11,0.9)]
                     flex items-center justify-center text-center`

                return (
              <div
                key={m.id}
                className={seatClass}
              >
                <span
                  className={`block max-w-full px-2 leading-none font-bold text-theme-text-main ${nameClass} truncate`}
                >
                  {m.name}
                </span>
              </div>
                )
              })()
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default AudiencePanel
