import { useState, useEffect } from 'react';
import type { AppState, DocumentMaster, DocumentInstance, ContentItem, TraceabilityLink, Suggestion } from './types';

const STORAGE_KEY = 'mbse_app_data';

const initialData: AppState = {
  masters: [
    {
      id: 'm1',
      name: 'L1 機体要求書',
      type: 'requirement',
      prefix: 'L1-',
      allowedParentMasterIds: []
    },
    {
      id: 'm2',
      name: 'L2 システム要求書',
      type: 'requirement',
      prefix: 'L2-',
      allowedParentMasterIds: ['m1']
    },
    {
      id: 'm3',
      name: 'BOM',
      type: 'bom',
      prefix: 'BOM-',
      allowedParentMasterIds: ['m2']
    }
  ],
  instances: [],
  items: [],
  links: [],
  suggestions: []
};

export function useStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialData,
        ...parsed,
        suggestions: parsed.suggestions || []
      };
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addMaster = (master: DocumentMaster) => {
    setState(prev => ({ ...prev, masters: [...prev.masters, master] }));
  };

  const updateMaster = (master: DocumentMaster) => {
    setState(prev => ({
      ...prev,
      masters: prev.masters.map(m => m.id === master.id ? master : m)
    }));
  };

  const addInstance = (instance: DocumentInstance) => {
    setState(prev => ({ ...prev, instances: [...prev.instances, instance] }));
  };

  const addItem = (item: ContentItem) => {
    setState(prev => ({ ...prev, items: [...prev.items, item] }));
  };

  const addItems = (items: ContentItem[]) => {
    setState(prev => ({ ...prev, items: [...prev.items, ...items] }));
  };

  const updateItem = (item: ContentItem) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === item.id ? item : i)
    }));
  };

  const deleteItem = (itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId),
      links: prev.links.filter(l => l.sourceItemId !== itemId && l.targetItemId !== itemId)
    }));
  };

  const addLink = (link: TraceabilityLink) => {
    setState(prev => ({ ...prev, links: [...prev.links, link] }));
  };

  const removeLink = (linkId: string) => {
    setState(prev => ({ ...prev, links: prev.links.filter(l => l.id !== linkId) }));
  };

  const addSuggestion = (suggestion: Suggestion) => {
    setState(prev => ({ ...prev, suggestions: [...prev.suggestions, suggestion] }));
  };

  const acceptSuggestion = (suggestionId: string) => {
    setState(prev => {
      const suggestion = prev.suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return prev;

      let newItems = [...prev.items];
      if (suggestion.targetItemId) {
        // Update existing item
        newItems = newItems.map(item => 
          item.id === suggestion.targetItemId 
            ? { ...item, body: suggestion.body, updatedAt: Date.now() } 
            : item
        );
      } else {
        // Add new item
        const newItem: ContentItem = {
          id: crypto.randomUUID(),
          masterId: suggestion.masterId,
          documentInstanceId: 'default',
          contentId: suggestion.contentId || 'NEW',
          body: suggestion.body,
          attributes: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        newItems.push(newItem);
      }

      return {
        ...prev,
        items: newItems,
        suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
      };
    });
  };

  const rejectSuggestion = (suggestionId: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
    }));
  };

  const acceptAllSuggestions = () => {
    setState(prev => {
      let newItems = [...prev.items];
      
      prev.suggestions.forEach(suggestion => {
        if (suggestion.targetItemId) {
          newItems = newItems.map(item => 
            item.id === suggestion.targetItemId 
              ? { ...item, body: suggestion.body, updatedAt: Date.now() } 
              : item
          );
        } else {
          const newItem: ContentItem = {
            id: crypto.randomUUID(),
            masterId: suggestion.masterId,
            documentInstanceId: 'default',
            contentId: suggestion.contentId || 'NEW',
            body: suggestion.body,
            attributes: {},
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          newItems.push(newItem);
        }
      });

      return {
        ...prev,
        items: newItems,
        suggestions: []
      };
    });
  };

  const rejectAllSuggestions = () => {
    setState(prev => ({
      ...prev,
      suggestions: []
    }));
  };

  return {
    state,
    addMaster,
    updateMaster,
    addInstance,
    addItem,
    addItems,
    updateItem,
    deleteItem,
    addLink,
    removeLink,
    addSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    acceptAllSuggestions,
    rejectAllSuggestions
  };
}
