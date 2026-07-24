/**
 * VirtualizedTableContainer.jsx — High-Performance Table Container Wrapper (Phase F4)
 * Prepared for high-volume rendering datasets.
 */

export default function VirtualizedTableContainer({ children, maxHeight = '600px' }) {
  return (
    <div
      style={{ maxHeight }}
      className="w-full overflow-x-auto overflow-y-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl"
    >
      <div className="min-w-full inline-block align-middle">{children}</div>
    </div>
  )
}
