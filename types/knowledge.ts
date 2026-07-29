// types/knowledge.ts
export interface DocumentChunk {
  id: string;
  pageNumber: number;
  text: string;
  documentName: string;
}

export interface SourceReference {
  pageNumber: number;
  textSnippet: string;
  documentName: string;
}