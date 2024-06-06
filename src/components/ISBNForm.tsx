// src/components/ISBNForm.tsx
import React, { useState } from 'react'
import { fetchAndAddBook } from '../utils/bookUtils'

const ISBNForm: React.FC = () => {
    const [isbn, setIsbn] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetchAndAddBook(isbn)
        setIsbn('')
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                ISBN:
                <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                />
            </label>
            <button type="submit">Add Book</button>
        </form>
    )
}

export default ISBNForm
