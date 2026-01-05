import React, { useEffect, useState } from 'react';
import { LayoutGrid, Settings, FileText, GitBranch, TableProperties, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sidebarCollapsed');
      if (raw !== null) setCollapsed(raw === 'true');
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    } catch (e) {
      /* ignore */
    }
  }, [collapsed]);

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutGrid },
    { id: 'master', label: 'マスタ設定', icon: Settings },
    { id: 'editor', label: 'ドキュメント編集', icon: FileText },
    { id: 'matrix', label: 'トレーサビリティ', icon: TableProperties },
    { id: 'tree', label: '影響範囲分析', icon: GitBranch },
    { id: 'diagram', label: 'ブロック図', icon: Share2 },
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-screen flex flex-col transition-all`}> 
      <div className="p-4 flex items-center justify-between text-xl font-bold border-b border-slate-800">
        <div className={`flex items-center space-x-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <span className={`${collapsed ? 'hidden' : ''}`}>eVTOL MBSE</span>
        </div>
        <button
          aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((s) => !s)}
          className="p-2 rounded hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${collapsed ? 'justify-center' : 'space-x-3'}`}
          >
            <item.icon size={20} />
            <span className={`${collapsed ? 'hidden' : ''}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
