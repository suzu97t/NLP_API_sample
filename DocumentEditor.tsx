import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Link as LinkIcon, Search, X, Sparkles, Layers, FileText, Edit3, ChevronRight, ChevronDown } from 'lucide-react';
import type { DocumentMaster, ContentItem, TraceabilityLink, Suggestion } from '../types';

interface DocumentEditorProps {
  store: any;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ store }) => {
  const { state, addItem, updateItem, deleteItem, addLink, removeLink, acceptSuggestion, rejectSuggestion } = store;
  const [selectedMasterId, setSelectedMasterId] = useState<string>(state.masters[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [linkingItemId, setLinkingItemId] = useState<string | null>(null);
    
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    requirement: true,
    bom: true
  });

  const toggleFolder = (type: string) => {
    setOpenFolders(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const mastersByType = useMemo(() => {
    const groups: Record<string, DocumentMaster[]> = {};
    state.masters.forEach((m: DocumentMaster) => {
      if (!groups[m.type]) groups[m.type] = [];
      groups[m.type].push(m);
    });
    return groups;
  }, [state.masters]);

  const selectedMaster = useMemo(() => 
    state.masters.find((m: any) => m.id === selectedMasterId),
    [state.masters, selectedMasterId]
  );

  const filteredItems = useMemo(() => {
    const items = state.items.filter((i: ContentItem) => i.masterId === selectedMasterId);
    if (!searchTerm) return items;
    return items.filter((i: ContentItem) => 
      i.body.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.contentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.items, selectedMasterId, searchTerm]);

  const handleAddNew = () => {
    if (!selectedMaster) return;
    
    const sameTypeItems = state.items.filter((i: ContentItem) => i.masterId === selectedMasterId);
    const nextNum = sameTypeItems.length + 1;
    const contentId = `${selectedMaster.prefix}${nextNum.toString().padStart(3, '0')}`;

    const newItem: ContentItem = {
      id: crypto.randomUUID(),
      masterId: selectedMasterId,
      documentInstanceId: 'default', // Simplified for now
      contentId,
      body: '',
      attributes: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    addItem(newItem);
  };

  const getParentLinks = (itemId: string) => {
    return state.links.filter((l: TraceabilityLink) => l.sourceItemId === itemId);
  };

  const getParentItem = (link: TraceabilityLink) => {
    return state.items.find((i: ContentItem) => i.id === link.targetItemId);
  };

  const getItemSuggestions = (itemId: string) => {
    return (state.suggestions || []).filter((s: Suggestion) => s.targetItemId === itemId);
  };

  const getNewItemSuggestions = () => {
    return (state.suggestions || []).filter((s: Suggestion) => !s.targetItemId && s.masterId === selectedMasterId);
  };

  const handleAddLink = (targetItemId: string) => {
    if (!linkingItemId) return;
    const newLink: TraceabilityLink = {
      id: crypto.randomUUID(),
      sourceItemId: linkingItemId,
      targetItemId
    };
    addLink(newLink);
    setLinkingItemId(null);
  };

  const openEditor = (item: ContentItem) => {
    setEditingItemId(item.id);
    setEditDraft(item.body || '');
  };

  const saveEdit = () => {
    if (!editingItemId) return;
    const item = state.items.find((i: ContentItem) => i.id === editingItemId);
    if (!item) return;
    updateItem({ ...item, body: editDraft, updatedAt: Date.now() });
    setEditingItemId(null);
    setEditDraft('');
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditDraft('');
  };

  return (
    <div className="flex h-full bg-white">
      {/* Document Explorer Sidebar */}
      <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2 bg-white">
          <Layers size={18} className="text-blue-600" />
          <span>エクスプローラー</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(mastersByType).map(([type, masters]) => (
            <div key={type} className="mb-2">
              <button
                onClick={() => toggleFolder(type)}
                className="w-full flex items-center gap-1 px-2 py-1.5 hover:bg-slate-200 rounded text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors"
              >
                {openFolders[type] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>{type}</span>

              </button>
              {openFolders[type] && (
                <div className="mt-1 space-y-0.5">
                  {masters.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMasterId(m.id)}
                      className={`w-full text-left px-6 py-2 rounded text-sm transition-all flex items-center justify-between gap-2 ${
                        selectedMasterId === m.id
                          ? 'bg-blue-100 text-blue-700 font-semibold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={14} className={selectedMasterId === m.id ? 'text-blue-600' : 'text-slate-400'} />
                        <span className="truncate">{m.name}</span>
                      </div>
                      {(state.suggestions || []).some((s: Suggestion) => s.masterId === m.id || (s.targetItemId && state.items.find((i: ContentItem) => i.id === s.targetItemId)?.masterId === m.id)) && (
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-800">
                {selectedMaster ? selectedMaster.name : 'ドキュメントを選択してください'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-64 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleAddNew}
                disabled={!selectedMaster}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  !selectedMaster ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus size={20} />
                <span>行追加</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-4 font-semibold text-slate-700 w-32">ID</th>
                  <th className="px-4 py-4 font-semibold text-slate-700">内容 (Content)</th>
                  <th className="px-4 py-4 font-semibold text-slate-700 w-48">親リンク (Traceability)</th>
                  <th className="px-4 py-4 font-semibold text-slate-700 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item: ContentItem) => {
                  const suggestions = getItemSuggestions(item.id);
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-mono text-sm text-blue-600 font-medium">{item.contentId}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <textarea
                              value={item.body}
                              onChange={(e) => updateItem({ ...item, body: e.target.value })}
                              className="flex-1 bg-transparent border-none focus:ring-1 focus:ring-blue-200 rounded p-1 resize-none min-h-[48px]"
                              rows={2}
                            />
                            <button
                              onClick={() => openEditor(item)}
                              className="text-slate-400 hover:text-blue-600 transition-colors p-1 shrink-0"
                              aria-label="Edit content"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {getParentLinks(item.id).map((link: TraceabilityLink) => (
                              <span key={link.id} className="inline-flex items-center bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs group">
                                {getParentItem(link)?.contentId}
                                <button
                                  onClick={() => removeLink(link.id)}
                                  className="ml-1 text-slate-400 hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                            <button
                              onClick={() => setLinkingItemId(item.id)}
                              className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                            >
                              <LinkIcon size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                              aria-label="Delete item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {suggestions.map((s: Suggestion) => (
                        <tr key={s.id} className="bg-amber-50/50 border-l-4 border-l-amber-400">
                          <td className="px-4 py-2 text-xs font-bold text-amber-600 uppercase tracking-wider">AI 修正案</td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-slate-700 bg-white p-2 rounded border border-amber-200 shadow-sm">
                              {s.body}
                            </div>
                          </td>
                          <td className="px-4 py-2" colSpan={2}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptSuggestion(s.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center gap-1"
                              >
                                <Sparkles size={12} /> 採用
                              </button>
                              <button
                                onClick={() => rejectSuggestion(s.id)}
                                className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300"
                              >
                                却下
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                {getNewItemSuggestions().map((s: Suggestion) => (
                  <tr key={s.id} className="bg-blue-50/50 border-l-4 border-l-blue-400">
                    <td className="px-4 py-4 font-mono text-sm text-blue-400 italic">{s.contentId || 'NEW'}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">AI 追加案</span>
                        <div className="text-sm text-slate-700 bg-white p-2 rounded border border-blue-200 shadow-sm">
                          {s.body}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4" colSpan={2}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptSuggestion(s.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Plus size={12} /> 追加
                        </button>
                        <button
                          onClick={() => rejectSuggestion(s.id)}
                          className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300"
                        >
                          却下
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                {selectedMaster ? 'データがありません。「行追加」ボタンで作成してください。' : '左側のエクスプローラーからドキュメントを選択してください。'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Picker Modal */}
      {linkingItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">親アイテムを選択</h3>
              <button onClick={() => setLinkingItemId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <div className="space-y-4">
                {state.items
                  .filter((i: ContentItem) => {
                    // Only show items from allowed parent masters
                    return selectedMaster?.allowedParentMasterIds.includes(i.masterId);
                  })
                  .map((i: ContentItem) => (
                    <div
                      key={i.id}
                      onClick={() => handleAddLink(i.id)}
                      className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="font-mono text-blue-600 font-bold mb-1">{i.contentId}</div>
                      <div className="text-slate-600 text-sm line-clamp-2">{i.body}</div>
                    </div>
                  ))}
                {state.items.filter((i: ContentItem) => {
                  return selectedMaster?.allowedParentMasterIds.includes(i.masterId);
                }).length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    リンク可能な親アイテムが見つかりません。マスタ設定で親ドキュメントタイプを確認してください。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editingItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl h-[80vh] max-h-[100vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">内容を編集</h3>
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] h-[46vh]"
              />
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                キャンセル
              </button>
              <button
                onClick={saveEdit}
                disabled={!editDraft.trim()}
                className={`px-4 py-2 rounded-md font-bold ${!editDraft.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;
