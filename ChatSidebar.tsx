import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import type { Suggestion, DocumentMaster, ContentItem } from '../types';

interface ChatSidebarProps {
  store: any;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ store }) => {
  const { state, addSuggestion, acceptAllSuggestions, rejectAllSuggestions } = store;
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem('chatSidebarOpen') === 'true';
    } catch {
      return false;
    }
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('chatSidebarOpen', String(isOpen));
  }, [isOpen]);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'こんにちは！何かお手伝いできることはありますか？' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setMessage('');

    // Simulate assistant response and suggestion generation
    setTimeout(() => {
      let assistantMsg = '承知いたしました。その件について調査します。';
      
      if (userMsg.includes('修正') || userMsg.includes('直して')) {
        const items = state.items || [];
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          const newSuggestion: Suggestion = {
            id: crypto.randomUUID(),
            targetItemId: randomItem.id,
            masterId: randomItem.masterId,
            body: `${randomItem.body} (AIによる修正案: より詳細な記述を追加しました)`,
            status: 'pending',
            createdAt: Date.now()
          };
          addSuggestion(newSuggestion);
          assistantMsg = `${randomItem.contentId} に対して修正案を作成しました。ドキュメントエディタで確認してください。`;
        } else {
          assistantMsg = '修正対象のアイテムが見つかりません。';
        }
      } else if (userMsg.includes('追加') || userMsg.includes('作成')) {
        // Create multiple suggestions across multiple masters (mock)
        const mastersToSuggest = state.masters.slice(0, Math.max(1, state.masters.length));
        let total = 0;
        
        mastersToSuggest.forEach((master: DocumentMaster) => {
          // Find the highest current number for this master's prefix across items and existing suggestions
          const getNumberFromId = (id: string) => {
            const match = id.match(/\d+$/);
            return match ? parseInt(match[0], 10) : 0;
          };

          const itemNums = (state.items || [])
            .filter((i: ContentItem) => i.masterId === master.id)
            .map((i: ContentItem) => getNumberFromId(i.contentId));
          
          const suggestionNums = (state.suggestions || [])
            .filter((s: Suggestion) => s.masterId === master.id && s.contentId)
            .map((s: Suggestion) => getNumberFromId(s.contentId!));

          const maxNum = Math.max(0, ...itemNums, ...suggestionNums);
          
          // create 2 proposals per master as a mock
          for (let j = 0; j < 2; j++) {
            const idx = maxNum + j + 1;
            const contentId = `${master.prefix}${idx.toString().padStart(3, '0')}`;
            const newSuggestion: Suggestion = {
              id: crypto.randomUUID(),
              masterId: master.id,
              contentId,
              body: `AIが提案する新しい項目 (${master.name} - 提案${j + 1})。例: 仕様の明確化や安全性要件の追加を検討してください。`,
              status: 'pending',
              createdAt: Date.now()
            };
            addSuggestion(newSuggestion);
            total += 1;
          }
        });
        assistantMsg = `複数の追加提案 (${total}) を作成しました。ドキュメントエディタで確認してください。`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    }, 1000);
  };

  return (
    <div className={`flex h-screen transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'} bg-white border-l border-slate-200`}>
      <div className="flex flex-col w-full overflow-hidden">
        {/* Header / Toggle Button */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
          {isOpen && (
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" /> 
              AI Assistant
            </span>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors ${!isOpen ? 'mx-auto' : ''}`}
            title={isOpen ? "閉じる" : "チャットを開く"}
          >
            {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {isOpen ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white">
              {(state.suggestions || []).length > 0 && (
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {(state.suggestions || []).length} 件の提案があります
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={acceptAllSuggestions}
                      className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-bold transition-colors border border-green-200"
                    >
                      <Check size={12} /> すべて採用
                    </button>
                    <button
                      onClick={rejectAllSuggestions}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded text-xs font-bold transition-colors border border-slate-200"
                    >
                      <X size={12} /> すべて却下
                    </button>
                  </div>
                </div>
              )}
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="AIに質問..."
                  className="w-full p-3 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
                  rows={3}
                />
                <button 
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="absolute right-2 bottom-2 p-2 text-blue-600 hover:bg-blue-50 disabled:text-slate-300 disabled:hover:bg-transparent rounded-lg transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 gap-4">
            <button 
              onClick={() => setIsOpen(true)} 
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              title="チャットを開く"
            >
              <MessageSquare size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
