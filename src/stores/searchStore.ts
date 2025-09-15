// src/stores/searchStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LibraryDocumentInterface, LibraryDocument } from "../types";
import { searchBNFDocument } from "../utils/libraryDocumentUtils";
import { intersection } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import { researchToApiFormat, createUpdateRequest } from '../services/syncService';
import { extractIdFromJsonLd } from '../utils/jsonLdUtils';

export interface CompetingDocumentsInterface extends Array<LibraryDocumentInterface> {
    getDivergentKeys: () => Array<string>
}

class CompetingDocuments extends Array<LibraryDocumentInterface> implements CompetingDocumentsInterface {
    getDivergentKeys() {
        const differences = [];
        const values: { [k: string]: Array<string | number | null> } = {};
        this.forEach(item => {
            for (const [key, value] of Object.entries(item)) {
                values[key] = values[key] ?? [];


                if (Array.isArray(value)) {
                    value.forEach((v, key2) => {
                        values[key][key2] = v && typeof v === 'object' ? JSON.stringify(value) : v;
                    })
                } else if (value && typeof value === 'object') {
                    values[key] = [...values[key], JSON.stringify(value)];
                } else {
                    values[key] = [...values[key], value];
                }
            }
        })

        for (const [key, value] of Object.entries(values)) {
            if (!value.every(v => v === value[0])) {
                differences.push(key)
            }

        }

        return differences
    }
}

export enum ResearchStatus {
    Error,
    Pending,
    Success,
}


type ScanFunction = (barcode: string) => Promise<void>;
type BnfRefreshFunction = (id: string) => Promise<void>;
type CompleteScanResearchFunction = (id: string, ...documents: LibraryDocumentInterface[]) => Promise<void>;
type AddResearchFunction = (documents: Array<LibraryDocumentInterface>, fromBnf: boolean) => Promise<void>;
type RemoveResearchFunction = (id: string) => void;
type CountFunction = () => number;
type BarcodeIsScannedFunction = (barcode: string) => boolean;
type HasSomeResearchedDocumentFunction = (document: LibraryDocumentInterface) => boolean;


export interface Research {
    id: string,
    documents: CompetingDocuments
    status: ResearchStatus,
    fromScan: boolean,
    fromBnf: boolean,
    // Ajout d'un flag pour indiquer si la recherche est synchronisée avec l'API
    synced?: boolean,
    // ID de l'API backend (peut être différent de l'ID local)
    apiId?: string,
}

export interface ManualResearch extends Research {
    fromScan: false,
}

export interface ScanResearch extends Research {
    fromScan: true,
    barcode: string,
}

interface ResearchStore {
    researches: { [id: string]: ScanResearch | ManualResearch },
    scan: ScanFunction,
    bnfRefresh: BnfRefreshFunction,
    completeScanResearch: CompleteScanResearchFunction,
    addResearch: AddResearchFunction,
    removeResearch: RemoveResearchFunction,
    count: CountFunction,
    barcodeIsScanned: BarcodeIsScannedFunction,
    hasSomeResearchedDocument: HasSomeResearchedDocumentFunction,
    // Nouvelles fonctions pour la synchronisation
    syncResearchToApi: (id: string) => Promise<void>,
    syncAllResearchesToApi: () => Promise<void>,
}

// Service de synchronisation (à injecter depuis l'extérieur)
let syncService: {
    createResearch: (data: any) => Promise<any>;
    updateResearch: (id: string, data: any) => Promise<any>;
    deleteResearch: (id: string) => Promise<void>;
} | null = null;

// Fonction pour injecter le service de synchronisation
export const setSyncService = (service: typeof syncService) => {
    syncService = service;
};


export const useSearchStore = create<ResearchStore>()(
    persist(
        (set, get) => ({
            researches: {},
            scan: async (barcode: string) => {
                if (get().barcodeIsScanned(barcode)) {
                    return;
                }

                const research: ScanResearch = { 
                    id: uuidv4(), 
                    documents: new CompetingDocuments(), 
                    status: ResearchStatus.Pending, 
                    fromScan: true, 
                    barcode: barcode, 
                    fromBnf: true,
                    synced: false
                };

                // Mise à jour locale immédiate
                set(state => ({ researches: { ...state.researches, [research.id]: research } }));

                try {
                    // Synchronisation avec l'API si disponible
                    if (syncService) {
                        try {
                            const apiData = researchToApiFormat(research);
                            const apiResponse = await syncService.createResearch(apiData);
                            // Extraire l'ID de l'URL JSON-LD (@id) ou utiliser l'ID simple
                            const apiId = extractIdFromJsonLd(apiResponse);
                            // Mettre à jour avec l'ID de l'API
                            set(state => ({
                                researches: {
                                    ...state.researches,
                                    [research.id]: {
                                        ...state.researches[research.id],
                                        apiId: apiId,
                                        synced: true
                                    }
                                }
                            }));
                        } catch (syncError) {
                            console.warn('Erreur de synchronisation lors de la création:', syncError);
                        }
                    }

                    // Recherche BNF
                    const documents = await searchBNFDocument(barcode);

                    const updatedResearch = {
                        ...research,
                        status: ResearchStatus.Success,
                        documents: new CompetingDocuments(...documents)
                    };

                    set(state => ({
                        researches: {
                            ...state.researches, 
                            [research.id]: updatedResearch
                        }
                    }));

                    // Synchronisation de la mise à jour
                    if (syncService && research.apiId) {
                        try {
                            const updateData = createUpdateRequest(research, updatedResearch);
                            await syncService.updateResearch(research.apiId, updateData);
                            set(state => ({
                                researches: {
                                    ...state.researches,
                                    [research.id]: {
                                        ...state.researches[research.id],
                                        synced: true
                                    }
                                }
                            }));
                        } catch (syncError) {
                            console.warn('Erreur de synchronisation lors de la mise à jour:', syncError);
                        }
                    }

                } catch (error) {
                    console.warn(error);
                    const errorResearch = {
                        ...research,
                        status: ResearchStatus.Error,
                    };
                    
                    set(state => ({
                        researches: {
                            ...state.researches, 
                            [research.id]: errorResearch
                        }
                    }));

                    // Synchronisation de l'erreur
                    if (syncService && research.apiId) {
                        try {
                            const updateData = createUpdateRequest(research, errorResearch);
                            await syncService.updateResearch(research.apiId, updateData);
                        } catch (syncError) {
                            console.warn('Erreur de synchronisation lors de la mise à jour d\'erreur:', syncError);
                        }
                    }
                }
            },
            bnfRefresh: async (id: string) => {
                const research = get().researches[id];
                if (!research?.fromBnf) {
                    throw new Error(`Research ${id} does not exists or is not from BNF`);
                }

                const pendingResearch = {
                    ...research,
                    status: ResearchStatus.Pending,
                };

                set(state => ({
                    researches: {
                        ...state.researches, 
                        [id]: pendingResearch
                    }
                }));

                // Synchronisation de l'état pending
                if (syncService && research.apiId) {
                    try {
                        const updateData = createUpdateRequest(research, pendingResearch);
                        await syncService.updateResearch(research.apiId, updateData);
                    } catch (syncError) {
                        console.warn('Erreur de synchronisation lors du refresh:', syncError);
                    }
                }

                try {
                    const documents = await searchBNFDocument(research.fromScan ? research.barcode : research.documents[0].getIdentifiers()[0]);
                    
                    const successResearch = {
                        ...research,
                        status: ResearchStatus.Success,
                        documents: new CompetingDocuments(...documents)
                    };

                    set(state => ({
                        researches: {
                            ...state.researches, 
                            [id]: successResearch
                        }
                    }));

                    // Synchronisation du succès
                    if (syncService && research.apiId) {
                        try {
                            const updateData = createUpdateRequest(research, successResearch);
                            await syncService.updateResearch(research.apiId, updateData);
                        } catch (syncError) {
                            console.warn('Erreur de synchronisation lors du refresh success:', syncError);
                        }
                    }

                } catch (error) {
                    console.warn(error);
                    const errorResearch = {
                        ...research,
                        status: ResearchStatus.Error,
                        documents: new CompetingDocuments()
                    };

                    set(state => ({
                        researches: {
                            ...state.researches, 
                            [id]: errorResearch
                        }
                    }));

                    // Synchronisation de l'erreur
                    if (syncService && research.apiId) {
                        try {
                            const updateData = createUpdateRequest(research, errorResearch);
                            await syncService.updateResearch(research.apiId, updateData);
                        } catch (syncError) {
                            console.warn('Erreur de synchronisation lors du refresh error:', syncError);
                        }
                    }
                }
            },
            completeScanResearch: async (id: string, ...documents: LibraryDocumentInterface[]) => {
                const research = get().researches[id];
                if (!research?.fromScan) {
                    throw new Error(`Research ${id} does not exists or is not from scan`);
                }

                const completedResearch = {
                    ...research,
                    status: ResearchStatus.Success,
                    documents: new CompetingDocuments(...documents)
                };

                set(state => ({
                    researches: {
                        ...state.researches, 
                        [id]: completedResearch
                    }
                }));

                // Synchronisation
                if (syncService && research.apiId) {
                    try {
                        const updateData = createUpdateRequest(research, completedResearch);
                        await syncService.updateResearch(research.apiId, updateData);
                    } catch (syncError) {
                        console.warn('Erreur de synchronisation lors de la completion:', syncError);
                    }
                }
            },
            addResearch: async (documents: Array<LibraryDocumentInterface>, fromBnf: boolean) => {
                const id = uuidv4();
                const research: ManualResearch = {
                    id,
                    status: ResearchStatus.Success,
                    documents: new CompetingDocuments(...documents),
                    fromScan: false,
                    fromBnf,
                    synced: false
                };

                set(state => ({
                    researches: {
                        ...state.researches, 
                        [id]: research
                    }
                }));

                // Synchronisation
                if (syncService) {
                    try {
                        const apiData = researchToApiFormat(research);
                        const apiResponse = await syncService.createResearch(apiData);
                        // Extraire l'ID de l'URL JSON-LD (@id) ou utiliser l'ID simple
                        const apiId = extractIdFromJsonLd(apiResponse);
                        set(state => ({
                            researches: {
                                ...state.researches,
                                [id]: {
                                    ...state.researches[id],
                                    apiId: apiId,
                                    synced: true
                                }
                            }
                        }));
                    } catch (syncError) {
                        console.warn('Erreur de synchronisation lors de l\'ajout:', syncError);
                    }
                }
            },
            removeResearch: async (id: string) => {
                const research = get().researches[id];
                
                // Synchronisation de la suppression
                if (syncService && research?.apiId) {
                    try {
                        await syncService.deleteResearch(research.apiId);
                    } catch (syncError) {
                        console.warn('Erreur de synchronisation lors de la suppression:', syncError);
                    }
                }

                set(state => {
                    const newResearches = { ...state.researches };
                    delete newResearches[id];
                    return { researches: newResearches };
                });
            },
            count: () => Object.keys(get().researches).length,
            barcodeIsScanned: (barcode: string) => Object.values(get().researches).some(research => research.fromScan && research.barcode === barcode),
            hasSomeResearchedDocument: (document: LibraryDocumentInterface) => Object.values(get().researches).some(research => research.documents.some(researchedDocument => intersection(researchedDocument.getIdentifiers(), document.getIdentifiers()).length)),

            // Nouvelles fonctions de synchronisation
            syncResearchToApi: async (id: string) => {
                const research = get().researches[id];
                if (!research || !syncService) return;

                try {
                    if (research.apiId) {
                        // Mise à jour
                        const updateData = createUpdateRequest(research, research);
                        await syncService.updateResearch(research.apiId, updateData);
                    } else {
                        // Création
                        const apiData = researchToApiFormat(research);
                        const apiResponse = await syncService.createResearch(apiData);
                        // Extraire l'ID de l'URL JSON-LD (@id) ou utiliser l'ID simple
                        const apiId = extractIdFromJsonLd(apiResponse);
                        set(state => ({
                            researches: {
                                ...state.researches,
                                [id]: {
                                    ...state.researches[id],
                                    apiId: apiId,
                                    synced: true
                                }
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Erreur de synchronisation:', error);
                    throw error;
                }
            },

            syncAllResearchesToApi: async () => {
                const researches = Object.values(get().researches);
                const unsyncedResearches = researches.filter(r => !r.synced);
                
                for (const research of unsyncedResearches) {
                    try {
                        await get().syncResearchToApi(research.id);
                    } catch (error) {
                        console.error(`Erreur de synchronisation pour la recherche ${research.id}:`, error);
                    }
                }
            },
        }),
        {
            name: 'search-store',
            partialize: (state) => ({ researches: state.researches }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    for (const id in state.researches) {
                        state.researches[id].documents = new CompetingDocuments(...state.researches[id].documents.map(doc => LibraryDocument.fromJson(doc)));

                        if (state.researches[id].fromBnf) {
                            setTimeout(() => {
                                state.bnfRefresh(id);
                            }, 100);
                        }
                    }
                }
            },
        }
    ),
)
