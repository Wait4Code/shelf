// src/components/DocumentItem.tsx
import React from 'react';
import {Box} from '@mui/material';
import {LibraryDocument} from '../types';
import {DocumentTitle} from './DocumentTitle';
import {Contributors} from './Contributors';
import {Publication} from './Publication';

interface DocumentItemProps {
    document: LibraryDocument;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({document}) => {
    const useStyles = {
        bookDetails: {
            display: 'flex',
            alignItems: 'center',
        },
        thumbnail: {
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
        },
        thumbnailContainer: {
            height: '110px',
            width: '90px',
            marginRight: '8px',
        }
    };

    return (
        <Box sx={useStyles.bookDetails}>
            <Box style={useStyles.thumbnailContainer}>
                <img
                    src={document.coverImageUrl ?? 'https://catalogue.bnf.fr/couverture?&appName=NE&idArk=&couverture=1'}
                    alt="Couverture"
                    style={useStyles.thumbnail}
                />
            </Box>
            <Box>
                <DocumentTitle document={document}/>
                <Contributors contributors={document.contributors}/>
                <Publication publication={document.publication}/>
            </Box>
        </Box>
    );
};
