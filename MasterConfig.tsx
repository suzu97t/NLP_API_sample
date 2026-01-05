import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import type { DocumentMaster, DocumentType } from '../types';

interface MasterConfigProps {
  store: any;
}

const MasterConfig: React.FC<MasterConfigProps> = ({ store }) => {
  const { state, addMaster, updateMaster } = store;
  const [editingMaster, setEditingMaster] = useState<DocumentMaster | null>(null);

  const handleCreateNew = () => {
    const newMaster: DocumentMaster = {
      id: crypto.randomUUID(),
      name: '新規ドキュメント',
      type: 'requirement',
      prefix: 'REQ-',
      allowedParentMasterIds: []
    };
    setEditingMaster(newMaster);
  };

  const handleSave = () => {
    if (!editingMaster) return;
    const exists = state.masters.find((m: any) => m.id === editingMaster.id);
    if (exists) {
      updateMaster(editingMaster);
    } else {
      addMaster(editingMaster);
    }
    setEditingMaster(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">マスタ設定</h1>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>新規作成</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">ドキュメントタイプ一覧</h2>
          {state.masters.map((master: DocumentMaster) => (
            <div
              key={master.id}
              onClick={() => setEditingMaster(master)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                editingMaster?.id === master.id
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="font-bold">{master.name}</div>
              <div className="text-sm text-slate-500">Prefix: {master.prefix}</div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {editingMaster ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6">設定編集</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
                    <input
                      type="text"
                      value={editingMaster.name}
                      onChange={(e) => setEditingMaster({ ...editingMaster, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">タイプ</label>
                    <input
                      type="text"
                      value={editingMaster.type}
                      onChange={(e) => setEditingMaster({ ...editingMaster, type: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="例: requirement, bom, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IDプレフィックス</label>
                    <input
                      type="text"
                      value={editingMaster.prefix}
                      onChange={(e) => setEditingMaster({ ...editingMaster, prefix: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">親ドキュメントタイプ</label>
                    <div className="w-full px-4 py-2 border border-slate-300 rounded-lg h-32 overflow-y-auto space-y-2">
                      {state.masters.filter((m: any) => m.id !== editingMaster.id).map((m: any) => (
                        <label key={m.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={editingMaster.allowedParentMasterIds.includes(m.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...editingMaster.allowedParentMasterIds, m.id]
                                : editingMaster.allowedParentMasterIds.filter(id => id !== m.id);
                              setEditingMaster({ ...editingMaster, allowedParentMasterIds: newIds });
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{m.name}</span>
                        </label>
                      ))}
                      {state.masters.filter((m: any) => m.id !== editingMaster.id).length === 0 && (
                        <div className="text-sm text-slate-400 italic">他のドキュメントタイプがありません</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-end space-x-4">
                  <button
                    onClick={() => setEditingMaster(null)}
                    className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                  >
                    <Save size={20} />
                    <span>保存</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              左側のリストから選択するか、新規作成してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterConfig;
