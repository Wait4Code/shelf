import React from 'react';
import { LibraryDocumentInterface } from '../types/LibraryDocumentInterface';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

interface BookItemProps {
    document: LibraryDocumentInterface;
}

export const BookItem: React.FC<BookItemProps> = ({ document }) => {
    return (
        <Card style={{ display: 'flex', marginBottom: 16 }}>
            {document.coverImageUrl && (
                <CardMedia
                    component="img"
                    style={{ width: 151 }}
                    image={document.coverImageUrl}
                    alt={document.title}
                />
            )}
            <CardContent>
                <Typography variant="h5">{document.title}</Typography>
                {/*<Typography variant="subtitle1" color="textSecondary">*/}
                {/*    {document.authors.join(', ')}*/}
                {/*</Typography>*/}
                <Typography variant="body2" color="textSecondary">
                    {document.publication?.publicationDate}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {document.publication?.publisher}
                </Typography>
            </CardContent>
        </Card>
    );
};
