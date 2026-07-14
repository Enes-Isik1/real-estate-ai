export type DealStatus =
  | "new"
  | "analyzing"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

  export type DealSource = 
  |'email' 
  | 'upload' 
  | 'manual';

export interface Deal {
  id: string;
  contactName: string;
  contactCompany?: string;
  propertyAddress: string;
  leadScore: number; // 0–100
  status: DealStatus;
  updatedAt: string; // ISO string
  source: DealSource;
}