// src/components/Publication.tsx
import React from 'react';
import {Typography} from '@mui/material';
import {Publication as PublicationType} from '../types';

interface PublicationProps {
    publication: PublicationType | null;
}

export const Publication: React.FC<PublicationProps> = ({publication}) => {
    if (!publication || (!publication.publisher && !publication.publicationDate)) {
        return null;
    }

    let text = publication.publisher
    text = text ? `${publication.publisher}, ${publication.publicationDate}` : publication.publicationDate;

    return (
        <Typography variant="body2">{text}</Typography>
    );
};
