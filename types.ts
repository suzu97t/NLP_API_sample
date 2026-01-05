export type DocumentType = string;

export interface DocumentMaster {
  id: string;
  name: string;
  type: DocumentType;
  prefix: string;
  allowedParentMasterIds: string[];
}

export interface DocumentInstance {
  id: string;
  masterId: string;
  projectName: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}

export interface ContentItem {
  id: string;
  masterId: string;
  documentInstanceId: string;
  contentId: string; // e.g., L1-001
  body: string;
  attributes: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface TraceabilityLink {
  id: string;
  sourceItemId: string; // Child
  targetItemId: string; // Parent
}

export interface Suggestion {
  id: string;
  targetItemId?: string; // If undefined, it's a new item suggestion
  masterId: string; // Required for new item suggestions
  contentId?: string; // For new items
  body: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface AppState {
  masters: DocumentMaster[];
  instances: DocumentInstance[];
  items: ContentItem[];
  links: TraceabilityLink[];
  suggestions: Suggestion[];
}
