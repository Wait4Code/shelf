// src/stores/searchStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LibraryDocumentInterface, LibraryDocument } from "../types";
import { searchBNFDocument } from "../utils/libraryDocumentUtils";
import { intersection } from "lodash";
import { v4 as uuidv4 } from 'uuid';

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


interface Research {
    id: string,
    documents: CompetingDocuments
    status: ResearchStatus,
    fromScan: boolean,
    fromBnf: boolean,
}

interface ManualResearch extends Research {
    fromScan: false,
}

interface ScanResearch extends Research {
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
}


export const useSearchStore = create<ResearchStore>()(
    persist(
        (set, get) => ({
            researches: {},
            scan: async (barcode: string) => {
                if (get().barcodeIsScanned(barcode)) {
                    return;
                }

                const research: ScanResearch = { id: uuidv4(), documents: new CompetingDocuments(), status: ResearchStatus.Pending, fromScan: true, barcode: barcode, fromBnf: true };

                set(state => ({ researches: { ...state.researches, [research.id]: research } }));

                try {
                    const documents = await searchBNFDocument(barcode);

                    set(state => ({
                        researches: {
                            ...state.researches, [research.id]: {
                                ...state.researches[research.id],
                                status: ResearchStatus.Success,
                                documents: new CompetingDocuments(...documents)
                            }
                        }
                    }));
                } catch (error) {
                    console.warn(error);
                    set(state => ({
                        researches: {
                            ...state.researches, [research.id]: {
                                ...state.researches[research.id],
                                status: ResearchStatus.Error,
                            }
                        }
                    }));
                }
            },
            bnfRefresh: async (id: string) => {
                const research = get().researches[id];
                if (!research?.fromBnf) {
                    throw new Error(`Research ${id} does not exists or is not from BNF`);
                }

                set(state => ({
                    researches: {
                        ...state.researches, [id]: {
                            ...state.researches[id],
                            status: ResearchStatus.Pending,
                        }
                    }
                }));

                try {
                    const documents = await searchBNFDocument(research.fromScan ? research.barcode : research.documents[0].getIdentifiers()[0]);
                    set(state => ({
                        researches: {
                            ...state.researches, [id]: {
                                ...state.researches[id],
                                status: ResearchStatus.Success,
                                documents: new CompetingDocuments(...documents)
                            }
                        }
                    }));
                } catch (error) {
                    console.warn(error);
                    set(state => ({
                        researches: {
                            ...state.researches, [id]: {
                                ...state.researches[id],
                                status: ResearchStatus.Error,
                                documents: new CompetingDocuments()
                            }
                        }
                    }));
                }



            },
            completeScanResearch: async (id: string, ...documents: LibraryDocumentInterface[]) => {
                const research = get().researches[id];
                if (!research?.fromScan) {
                    throw new Error(`Research ${id} does not exists or is not from scan`);
                }

                set(state => ({
                    researches: {
                        ...state.researches, [id]: {
                            ...state.researches[id],
                            status: ResearchStatus.Success,
                            documents: new CompetingDocuments(...documents)
                        }
                    }
                }));


            },
            addResearch: async (documents: Array<LibraryDocumentInterface>, fromBnf: boolean) => {
                const id = uuidv4();
                set(state => ({
                    researches: {
                        ...state.researches, [id]: {
                            id,
                            status: ResearchStatus.Success,
                            documents: new CompetingDocuments(...documents),
                            fromScan: false,
                            fromBnf,
                        }
                    }
                }));
            },
            removeResearch: (id: string) => {
                set(state => {
                    const newResearches = { ...state.researches };
                    delete newResearches[id];
                    return { researches: newResearches };
                });
            },
            count: () => Object.keys(get().researches).length,
            barcodeIsScanned: (barcode: string) => Object.values(get().researches).some(research => research.fromScan && research.barcode === barcode),
            hasSomeResearchedDocument: (document: LibraryDocumentInterface) => Object.values(get().researches).some(research => research.documents.some(researchedDocument => intersection(researchedDocument.getIdentifiers(), document.getIdentifiers()).length)),
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
