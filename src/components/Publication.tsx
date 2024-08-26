// src/components/Publication.tsx
import React from 'react';
import {Typography} from '@mui/material';
import {Publication as PublicationType} from '../types';

interface PublicationProps {
    publication: PublicationType | null;
}

export const Publication: React.FC<PublicationProps> = ({publication}) => {
    if (!publication) {
        return null;
    }

    return (
        <Typography variant="body2">
            {publication.publisher}, {publication.publicationDate}
        </Typography>
    );
};
