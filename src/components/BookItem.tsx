import React from 'react';
import { Book } from '../types/Book';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

interface BookItemProps {
    book: Book;
}

export const BookItem: React.FC<BookItemProps> = ({ book }) => {
    return (
        <Card style={{ display: 'flex', marginBottom: 16 }}>
            {book.cover && (
                <CardMedia
                    component="img"
                    style={{ width: 151 }}
                    image={book.cover}
                    alt={book.title}
                />
            )}
            <CardContent>
                <Typography variant="h5">{book.title}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    {book.authors.join(', ')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {book.publicationDate}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {book.publishers.join(', ')}
                </Typography>
            </CardContent>
        </Card>
    );
};
