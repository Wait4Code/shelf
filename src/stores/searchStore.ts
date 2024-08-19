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
    documents: LibraryDocumentInterface[]
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
            documents: [],
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
                    state.researches[idx].documents = documents;

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
            documents: [document],
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
