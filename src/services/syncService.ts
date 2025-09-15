// src/services/syncService.ts
import {  ResearchStatus, ScanResearch, ManualResearch } from '../stores/searchStore';
import { ApiResearchedItem, CreateResearchedItemRequest, UpdateResearchedItemRequest } from './apiService';
import { extractIdFromJsonLd } from '../utils/jsonLdUtils';

// Mapper les statuts entre frontend et backend
const mapStatusToApi = (status: ResearchStatus): 0 | 1 | 2 => {
  switch (status) {
    case ResearchStatus.Error:
      return 0;
    case ResearchStatus.Pending:
      return 1;
    case ResearchStatus.Success:
      return 2;
    default:
      return 1;
  }
};

const mapStatusFromApi = (status: 0 | 1 | 2): ResearchStatus => {
  switch (status) {
    case 0:
      return ResearchStatus.Error;
    case 1:
      return ResearchStatus.Pending;
    case 2:
      return ResearchStatus.Success;
    default:
      return ResearchStatus.Pending;
  }
};

// Convertir une recherche Zustand vers le format API
export const researchToApiFormat = (research: ScanResearch|ManualResearch): CreateResearchedItemRequest => {
  const baseData = {
    id: research.id, // Inclure l'ID généré par uuidv4()
    status: mapStatusToApi(research.status),
    fromScan: research.fromScan,
    fromBnf: research.fromBnf,
    // Pour l'instant, on ne synchronise pas les documents car ils nécessitent des IRIs
    // competingDocuments: [], // Les documents seront gérés séparément
  };

  // Ajouter le barcode si c'est une recherche de scan
  if (research.fromScan) {
    return {
      '@type': 'ResearchedItem',
      ...baseData,
      barcode: research.barcode,
    };
  }

  return {
    '@type': 'ResearchedItem',
    ...baseData,
  };
};

// Convertir une recherche API vers le format Zustand
export const apiToResearchFormat = (apiItem: ApiResearchedItem): ScanResearch|ManualResearch => {
  // Extraire l'ID de l'URL JSON-LD (@id) ou utiliser l'ID simple
  const id = extractIdFromJsonLd(apiItem);
  
  const baseResearch = {
    id,
    status: mapStatusFromApi(apiItem.status),
    fromScan: apiItem.fromScan,
    fromBnf: apiItem.fromBnf,
    documents: new (require('../stores/searchStore').CompetingDocuments)(...apiItem.competingDocuments),
    apiId: id, // Stocker l'ID de l'API
    synced: true, // Marquer comme synchronisé
  };

  // Si c'est une recherche de scan, ajouter le barcode
  if (apiItem.fromScan && apiItem.barcode) {
    return {
      ...baseResearch,
      barcode: apiItem.barcode,
    } as ScanResearch;
  }

  return baseResearch as ManualResearch;
};

// Créer une requête de mise à jour à partir des changements
export const createUpdateRequest = (
  currentResearch: ScanResearch|ManualResearch,
  updatedResearch: ScanResearch|ManualResearch
): UpdateResearchedItemRequest => {
  const changes: UpdateResearchedItemRequest = {};

  if (currentResearch.status !== updatedResearch.status) {
    changes.status = mapStatusToApi(updatedResearch.status);
  }

  if (currentResearch.fromScan !== updatedResearch.fromScan) {
    changes.fromScan = updatedResearch.fromScan;
  }

  if (currentResearch.fromBnf !== updatedResearch.fromBnf) {
    changes.fromBnf = updatedResearch.fromBnf;
  }

  // Les documents ne sont pas synchronisés car ils nécessitent des IRIs
  // TODO: Implémenter la synchronisation des documents via des IRIs

  // Vérifier le barcode pour les recherches de scan
  if (updatedResearch.fromScan) {
    const currentBarcode = 'barcode' in currentResearch ? currentResearch.barcode : undefined;
    if (currentBarcode !== updatedResearch.barcode) {
      changes.barcode = updatedResearch.barcode;
    }
  }

  return changes;
};
