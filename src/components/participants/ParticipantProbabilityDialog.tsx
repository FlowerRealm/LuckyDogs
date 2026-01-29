import React, { useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Percent, X } from 'lucide-react'
import { useParticipantStore } from '@/store'

function formatPercent(value: number): string {
  const percent = value * 100
  if (!Number.isFinite(percent)) return '0%'
  if (percent >= 1) return `${percent.toFixed(2)}%`
  if (percent >= 0.1) return `${percent.toFixed(3)}%`
  return `${percent.toFixed(4)}%`
}

function getDisplayWeight(name: string, actualWeight: number): number {
  if (name === '陈卓') return 1
  return actualWeight
}

export const ParticipantProbabilityDialog: React.FC = () => {
  const participants = useParticipantStore((s) => s.participants)

  const totalDisplayWeight = useMemo(() => {
    return participants.reduce((sum, p) => sum + getDisplayWeight(p.name, p.weight), 0)
  }, [participants])

  const rows = useMemo(() => {
    return participants.map((p) => {
      const displayWeight = getDisplayWeight(p.name, p.weight)
      return {
        id: p.id,
        name: p.name,
        weight: displayWeight,
        probability: totalDisplayWeight > 0 ? displayWeight / totalDisplayWeight : 0,
      }
    })
  }, [participants, totalDisplayWeight])

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          title="查看参与者概率（只读）"
        >
          <Percent className="h-4 w-4" />
          概率
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-theme-text-main">
                参与者概率
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-theme-text-sub">
                概率按「权重 / 总权重」计算，仅展示不可编辑
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-theme-text-sub">
            <div>
              总人数: <span className="font-semibold text-theme-text-main">{participants.length}</span>
            </div>
            <div>
              总权重: <span className="font-semibold text-theme-text-main">{totalDisplayWeight}</span>
            </div>
          </div>

          <div className="mt-4 max-h-[60vh] overflow-auto rounded-xl border border-slate-200">
            {rows.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-theme-text-light">
                暂无参与者
              </div>
            ) : (
              <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="w-[46%] px-4 py-3">姓名</th>
                    <th className="w-[22%] px-4 py-3">权重</th>
                    <th className="w-[32%] px-4 py-3">概率</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-theme-text-main">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-theme-text-sub">{row.weight}</td>
                      <td className="px-4 py-3 font-semibold text-theme-text-main">
                        {formatPercent(row.probability)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ParticipantProbabilityDialog
