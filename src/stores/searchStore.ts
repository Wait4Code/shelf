// src/stores/searchStore.ts
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {LibraryDocumentInterface, LibraryDocument} from "../types";
import {searchBNFDocument} from "../utils/libraryDocumentUtils";
import {flatten, intersection} from "lodash";


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
    addDocumentsToResearch: addDocumentsToResearchFunction
    clear: VoidFunction,
    removeResearch: RemoveResearchFunction,
    hasIdentifier: HasIdentifierFunction,
    hasAnyIdentifier: HasAnyIdentifierFunction,
    hasAnyIdentifierWithDocuments: HasAnyIdentifierFunction,
    count: CountFunction
}

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


type ResearchFunction = (barcode: string) => Promise<void>;
type AddLibraryDocumentFunction = (document: LibraryDocumentInterface) => Promise<void>;
type addDocumentsToResearchFunction = (identifiers: Array<string>, ...documents: LibraryDocumentInterface[]) => Promise<void>;
type RemoveResearchFunction = (identifiers: Array<string>) => void;
type HasIdentifierFunction = (identifier: string) => boolean;
type HasAnyIdentifierFunction = (...identifiers: string[]) => boolean;
type CountFunction = () => number;

// Fonction pour réhydrater les documents depuis le localStorage
const rehydrateDocuments = (researches: Array<LibraryDocumentResearch>): Array<LibraryDocumentResearch> => {
    return researches.map(research => ({
        ...research,
        documents: new CompetingDocuments(
            ...research.documents.map(doc => LibraryDocument.fromJson(doc))
        )
    }));
};

export const useSearchStore = create<ResearchStore>()(
    persist(
        (set, get) => ({
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
            set(addDocument(research.identifiers, documents))
        } catch (error) {
            set(state => {
                const idx = state.researches.findIndex(item => research.identifiers === item.identifiers);
                state.researches[idx].status = ResearchStatus.Error;

                console.warn(error);
                return {researches: [...state.researches]};
            });
        }


    },
    addLibraryDocument: async (document: LibraryDocumentInterface) => {
        // on ajoute une nouvelle recherche
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
    addDocumentsToResearch: async (identifiers, ...documents) => {
        // on ajoute des documents à une recherche existante
        if (!get().hasAnyIdentifier(...identifiers)) {
            return;
        }


        set(addDocument(identifiers, documents))
    },
    clear: () => set({researches: []}),
    removeResearch: (identifiers: Array<string>) => {
        set(state => ({
            researches: state.researches.filter(research => 
                !research.identifiers.some(id => identifiers.includes(id))
            )
        }));
    },
    hasIdentifier: identifier => Boolean(get().researches.find(item => item.identifiers.includes(identifier))),
    hasAnyIdentifier: (...identifiers) => Boolean(get().researches.find(item => intersection(item.identifiers, identifiers).length)),
    hasAnyIdentifierWithDocuments: (...identifiers) => Boolean(get().researches.find(item => intersection(item.identifiers, identifiers).length && item.documents.length > 0)),
    count: () => get().researches.length,
        }),
        {
            name: 'search-store',
            partialize: (state) => ({ researches: state.researches }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.researches = rehydrateDocuments(state.researches);
                }
            },
        }
    )
);

const addDocument = (identifiers: Array<string>, documents: Array<LibraryDocumentInterface>) => (state: ResearchStore) => {
    const idx = state.researches.findIndex(item => identifiers === item.identifiers);
    state.researches[idx].status = ResearchStatus.Success;
    state.researches[idx].documents = new CompetingDocuments(...documents);
    state.researches[idx].identifiers = [
        ...state.researches[idx].identifiers,
        ...flatten(documents.map(document => document.getIdentifiers()))
    ];

    return {researches: [...state.researches]};
}
