// src/stores/bookStore.ts
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {LibraryDocumentInterface} from '../types'



interface DocumentStore {
    documents: LibraryDocumentInterface[]
    addDocument: (document: LibraryDocumentInterface) => void
}

export const useBookStore = create(
    persist<DocumentStore>(
        set => ({
            documents: [],
            addDocument: document =>
                set(state => ({
                    documents: [...state.documents, document],
                })),
        }),
        {
            name: 'document-storage', // Nom de l'entrée dans le local storage
        }
    )
)
