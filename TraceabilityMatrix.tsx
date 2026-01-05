import React, { useState, useMemo } from 'react';
import type { ContentItem, TraceabilityLink } from '../types';

interface TraceabilityMatrixProps {
  store: any;
}

const TraceabilityMatrix: React.FC<TraceabilityMatrixProps> = ({ store }) => {
  const { state } = store;
  const [rowMasterId, setRowMasterId] = useState(state.masters[0]?.id || '');
  const [colMasterId, setColMasterId] = useState(state.masters[1]?.id || '');

  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; title: string; body: string }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    body: '',
  });

  const showTooltip = (e: React.MouseEvent, item: ContentItem) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.min(rect.right + 8, window.innerWidth - 360);
    const y = Math.max(8, rect.top);
    setTooltip({ visible: true, x, y, title: item.contentId, body: item.body || '' });
  };

  const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

  const rowMaster = state.masters.find((m: any) => m.id === rowMasterId);
  const colMaster = state.masters.find((m: any) => m.id === colMasterId);

  const rowItems = useMemo(() => 
    state.items.filter((i: ContentItem) => i.masterId === rowMasterId),
    [state.items, rowMasterId]
  );

  const colItems = useMemo(() => 
    state.items.filter((i: ContentItem) => i.masterId === colMasterId),
    [state.items, colMasterId]
  );

  const isLinked = (rowId: string, colId: string) => {
    // Check if colItem (child) is linked to rowItem (parent)
    return state.links.some((l: TraceabilityLink) => 
      l.sourceItemId === colId && l.targetItemId === rowId
    );
  };

  // Check if a row has any links
  const isRowLinked = (rowId: string) => {
    return colItems.some((col: ContentItem) => isLinked(rowId, col.id));
  };

  // Check if a column has any links
  const isColLinked = (colId: string) => {
    return rowItems.some((row: ContentItem) => isLinked(row.id, colId));
  };

  const toggleLink = (rowId: string, colId: string) => {
    // existing link where source = child(col) and target = parent(row)
    const existing = state.links.find((l: TraceabilityLink) => l.sourceItemId === colId && l.targetItemId === rowId);
    if (existing) {
      if (typeof store.removeLink === 'function') store.removeLink(existing.id);
      return;
    }

    const newLink: TraceabilityLink = {
      id: `link-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      sourceItemId: colId,
      targetItemId: rowId,
    };
    if (typeof store.addLink === 'function') store.addLink(newLink);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">トレーサビリティマトリクス</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">行:</span>
            <select
              value={rowMasterId}
              onChange={(e) => setRowMasterId(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-sm"
            >
              {state.masters.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">列:</span>
            <select
              value={colMasterId}
              onChange={(e) => setColMasterId(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-sm"
            >
              {state.masters.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto max-h-[70vh]">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 bg-slate-100 border border-slate-200 p-4 min-w-[200px]">
                {rowMaster?.name} \ {colMaster?.name}
              </th>
              {colItems.map((col: ContentItem) => {
                const colHasLink = isColLinked(col.id);
                return (
                  <th
                    key={col.id}
                    onMouseEnter={(e) => showTooltip(e, col)}
                    onMouseLeave={hideTooltip}
                    className={`sticky top-0 z-10 border border-slate-200 p-2 min-w-[80px] text-xs font-mono whitespace-nowrap h-24 ${
                      colHasLink ? 'bg-slate-50' : 'bg-yellow-100'
                    }`}
                  >
                    {col.contentId}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rowItems.map((row: ContentItem) => {
              const rowHasLink = isRowLinked(row.id);
              return (
                <tr
                  key={row.id}
                  className={rowHasLink ? '' : 'bg-yellow-100'}
                >
                  <td className={`sticky left-0 z-10 border border-slate-200 p-4 text-sm font-medium ${rowHasLink ? 'bg-slate-50' : 'bg-yellow-100'}`}>
                    <div
                      onMouseEnter={(e) => showTooltip(e, row)}
                      onMouseLeave={hideTooltip}
                      className="font-mono text-blue-600"
                    >
                      {row.contentId}
                    </div>
                    <div className="text-slate-500 text-xs truncate w-48">{row.body}</div>
                  </td>
                  {colItems.map((col: ContentItem) => {
                    const linked = isLinked(row.id, col.id);
                    const colHasLink = isColLinked(col.id);
                    return (
                      <td
                        key={col.id}
                        onClick={() => toggleLink(row.id, col.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleLink(row.id, col.id); }}
                        className={`cursor-pointer select-none border border-slate-200 p-2 text-center transition-colors ${
                          linked
                            ? 'bg-blue-100'
                            : colHasLink
                              ? 'hover:bg-slate-50'
                              : 'bg-yellow-100'
                        }`}
                      >
                        {linked && <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto" />}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex items-center space-x-6 text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
          <span>リンクあり</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 border border-slate-300 rounded-full" />
          <span>リンクなし</span>
        </div>
      </div>

      {tooltip.visible && (
        <div
          className="fixed z-50 p-3 bg-white border border-slate-200 rounded shadow max-w-md max-h-48 overflow-auto text-sm"
          style={{ left: tooltip.x, top: tooltip.y, width: 340 }}
        >
          <div className="font-mono text-sm text-blue-600">{tooltip.title}</div>
          <div className="text-slate-600 text-xs mt-1 whitespace-pre-wrap">{tooltip.body}</div>
        </div>
      )}
    </div>
  );
};

export default TraceabilityMatrix;
