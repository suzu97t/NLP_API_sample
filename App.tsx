import { useState } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ChatSidebar from './components/ChatSidebar.tsx';
import MasterConfig from './components/MasterConfig.tsx';
import DocumentEditor from './components/DocumentEditor.tsx';
import TraceabilityMatrix from './components/TraceabilityMatrix.tsx';
import TreeView from './components/TreeView.tsx';
import BlockDiagram from './components/BlockDiagram.tsx';
import { useStore } from './store.ts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const store = useStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'master':
        return <MasterConfig store={store} />;
      case 'editor':
        return <DocumentEditor store={store} />;
      case 'matrix':
        return <TraceabilityMatrix store={store} />;
      case 'tree':
        return <TreeView store={store} />;
      case 'diagram':
        return <BlockDiagram store={store} />;
      default:
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium">定義済みマスタ</h3>
                <p className="text-3xl font-bold mt-2">{store.state.masters.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium">ドキュメント項目数</h3>
                <p className="text-3xl font-bold mt-2">{store.state.items.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium">トレースリンク数</h3>
                <p className="text-3xl font-bold mt-2">{store.state.links.length}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
      <ChatSidebar store={store} />
    </div>
  );
}

export default App;
