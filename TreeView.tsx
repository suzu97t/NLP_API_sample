import React, { useState } from 'react';
import { ChevronRight, ChevronDown, GitBranch, Sparkles } from 'lucide-react';
import type { ContentItem, TraceabilityLink } from '../types';

interface TreeViewProps {
  store: any;
}

const TreeView: React.FC<TreeViewProps> = ({ store }) => {
  const { state } = store;
  const [selectedRootId, setSelectedRootId] = useState<string>('');

  const rootItems = state.items.filter((i: ContentItem) => {
    // Items that have no parents are potential roots
    return !state.links.some((l: TraceabilityLink) => l.sourceItemId === i.id);
  });

  const renderNode = (itemId: string, depth: number = 0) => {
    const item = state.items.find((i: ContentItem) => i.id === itemId);
    if (!item) return null;

    const children = state.links
      .filter((l: TraceabilityLink) => l.targetItemId === itemId)
      .map((l: TraceabilityLink) => l.sourceItemId);

    const hasSuggestion = state.suggestions.some((s: any) => s.targetItemId === itemId);

    return (
      <div key={itemId} className="ml-6">
        <div className="flex items-center space-x-3 py-2 group">
          <div className="w-px h-full bg-slate-200 absolute -left-3" />
          <div className={`p-3 rounded-xl border bg-white shadow-sm transition-all group-hover:border-blue-400 ${depth === 0 ? 'border-blue-200 ring-2 ring-blue-50' : 'border-slate-200'} ${hasSuggestion ? 'border-amber-300 ring-2 ring-amber-50' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {item.contentId}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {state.masters.find((m: any) => m.id === item.masterId)?.name}
                </span>
              </div>
              {hasSuggestion && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  <Sparkles size={10} /> 修正案あり
                </span>
              )}
            </div>
            <div className="text-sm text-slate-700 max-w-md">{item.body || '(内容なし)'}</div>
          </div>
        </div>
        {children.length > 0 && (
          <div className="relative">
            {children.map((childId: string) => renderNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">影響範囲分析 (ツリービュー)</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-500">起点を選択:</span>
          <select
            value={selectedRootId}
            onChange={(e) => setSelectedRootId(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">選択してください</option>
            {state.items.map((i: ContentItem) => (
              <option key={i.id} value={i.id}>{i.contentId}: {i.body.substring(0, 20)}...</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 min-h-[600px] overflow-auto">
        {selectedRootId ? (
          <div className="relative">
            {renderNode(selectedRootId)}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <GitBranch size={48} className="opacity-20" />
            <p>起点となる要求または部品を選択して、影響範囲を可視化します</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeView;
