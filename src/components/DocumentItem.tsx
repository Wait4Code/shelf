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
            alignItems: 'stretch',
            gap: 2
        },
        thumbnail: {
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
        },
        thumbnailContainer: {
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            height: {xs: 0.75 * 110, md: 110},
            width: {xs: 110 / 1.5 * 0.75, md: 110 / 1.5},
        }
    };

    return (
        <Box sx={useStyles.bookDetails}>
            <Box sx={useStyles.thumbnailContainer}>
                <img
                    src={document.coverImageUrl ?? 'https://catalogue.bnf.fr/couverture?&appName=NE&idArk=&couverture=1'}
                    alt="Couverture"
                    style={useStyles.thumbnail}
                />
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                <DocumentTitle document={document}/>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <Contributors contributors={document.contributors}/>
                    <Publication publication={document.publication}/>
                </Box>
            </Box>
        </Box>
    );
};
