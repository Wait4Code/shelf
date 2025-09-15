// src/types/api.ts
// Types partagés pour l'API et la synchronisation

export type ApiResearchStatus = 'ERROR' | 'PENDING' | 'SUCCESS';

export interface ApiResearchedItem {
  id: string;
  status: ApiResearchStatus;
  fromScan: boolean;
  fromBnf: boolean;
  barcode?: string;
  competingDocuments: any[];
  createdAt: string;
}

export interface CreateResearchedItemRequest {
  status: ApiResearchStatus;
  fromScan: boolean;
  fromBnf: boolean;
  barcode?: string;
  competingDocuments?: any[];
}

export interface UpdateResearchedItemRequest {
  status?: ApiResearchStatus;
  fromScan?: boolean;
  fromBnf?: boolean;
  barcode?: string;
  competingDocuments?: any[];
}

// Mapping entre les enums frontend et backend
export const ResearchStatusMapping = {
  // Frontend vers API
  toApi: {
    0: 'ERROR' as const,   // ResearchStatus.Error
    1: 'PENDING' as const, // ResearchStatus.Pending
    2: 'SUCCESS' as const, // ResearchStatus.Success
  },
  // API vers Frontend
  fromApi: {
    'ERROR': 0,   // ResearchStatus.Error
    'PENDING': 1, // ResearchStatus.Pending
    'SUCCESS': 2, // ResearchStatus.Success
  }
} as const;
