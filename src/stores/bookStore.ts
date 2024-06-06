// src/stores/bookStore.ts
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {Book} from '../types/Book'


interface BookStore {
    books: Book[]
    addBook: (book: Book) => void
    getBookByISBN: (isbn: string) => Book | undefined
    isBookInStore: (isbn: string) => boolean
}

export const useBookStore = create(
    persist<BookStore>(
        (set, get) => ({
            books: [],
            addBook: book =>
                set(state => ({
                    books: [...state.books, book],
                })),
            getBookByISBN: isbn =>
                get().books.find(book => book.isbn === isbn),
            isBookInStore: isbn =>
                get().books.some(book => book.isbn === isbn),
        }),
        {
            name: 'book-storage', // Nom de l'entrée dans le local storage
        }
    )
)
