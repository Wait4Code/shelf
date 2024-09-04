// src/stores/searchStore.ts
import {create} from 'zustand';
import {LibraryDocumentInterface} from "../types";
import {searchBNFDocument} from "../utils/libraryDocumentUtils";
import {intersection} from "lodash";


export enum ResearchStatus {
    Error,
    Pending,
    Success,
}


interface LibraryDocumentResearch {
    documents: CompetingDocuments
    status: ResearchStatus,
    identifiers: Array<string>,
}

interface ResearchStore {
    researches: Array<LibraryDocumentResearch>
    research: ResearchFunction,
    addLibraryDocument: AddLibraryDocumentFunction,
    clear: VoidFunction,
    hasIdentifier: HasIdentifierFunction,
    hasAnyIdentifier: HasAnyIdentifierFunction,
    count: CountFunction
}

interface CompetingDocumentsInterface {
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


type ResearchFunction = (barcode: string) => Promise<void>;
type AddLibraryDocumentFunction = (document: LibraryDocumentInterface) => Promise<void>;
type HasIdentifierFunction = (identifier: string) => boolean;
type HasAnyIdentifierFunction = (...identifiers: string[]) => boolean;
type CountFunction = () => number;


export const useSearchStore = create<ResearchStore>((set, get) => ({
    researches: [],
    research: async (barcode: string) => {
        if (get().hasIdentifier(barcode)) {
            return;
        }

        const research: LibraryDocumentResearch = {
            documents: new CompetingDocuments(),
            status: ResearchStatus.Pending,
            identifiers: [barcode]
        }

        set(state => ({researches: [...state.researches, research]}));

        try {
            const documents = await searchBNFDocument(barcode);

            if (!documents) {
                set(state => {
                    const idx = state.researches.findIndex(item => research.identifiers === item.identifiers);
                    state.researches[idx].status = ResearchStatus.Error;

                    return {researches: [...state.researches]};
                });
            } else {
                set(state => {
                    const idx = state.researches.findIndex(item => research.identifiers === item.identifiers);
                    state.researches[idx].status = ResearchStatus.Success;
                    state.researches[idx].documents = new CompetingDocuments(...documents);

                    return {researches: [...state.researches]};

                })
            }
        } catch (error) {
            set(state => {
                const idx = state.researches.findIndex(item => research.identifiers === item.identifiers);
                state.researches[idx].status = ResearchStatus.Error;

                return {researches: [...state.researches]};
            });
        }


    },
    addLibraryDocument: async (document: LibraryDocumentInterface) => {
        if (get().hasAnyIdentifier(...document.getIdentifiers())) {
            return;
        }

        const research: LibraryDocumentResearch = {
            documents: new CompetingDocuments(document),
            status: ResearchStatus.Success,
            identifiers: document.getIdentifiers(),
        }

        set(state => ({researches: [...state.researches, research]}));
    },
    clear: () => set({researches: []}),
    hasIdentifier: identifier => Boolean(get().researches.find(item => item.identifiers.includes(identifier))),
    hasAnyIdentifier: (...identifiers) => Boolean(get().researches.find(item => intersection(item.identifiers, identifiers).length)),
    count: () => get().researches.length,
}));
