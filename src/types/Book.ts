export interface Book {
    isbn: string
    title: string
    authors: Array<string>
    publicationDate: string
    summary?: string
    cover?: string
    publishers: Array<string>
}
