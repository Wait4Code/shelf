// src/components/DocumentTitle.tsx
import React from 'react';
import {Box, Typography} from '@mui/material';
import {LibraryDocument} from '../types';

interface DocumentTitleProps {
    document: LibraryDocument;
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({document}) => {
    const volumeNumber = document.getVolumeNumber();
    const documentSubtitle = document.partTitle ?? document.subtitle;
    const seriesTitle = document.series?.title;

    let main = document.title;
    let numbering = null;
    let sub = null
    if (volumeNumber) {
        numbering = `Tome ${volumeNumber}`;
    }


    if (!numbering && documentSubtitle) {
        main += `, ${documentSubtitle}`;
    }
    if (numbering && seriesTitle && seriesTitle !== main) {
        sub = `${seriesTitle} · ${numbering}`;
    }
    if (numbering && documentSubtitle) {
        sub = `${sub ?? numbering} : ${documentSubtitle}`;
    }


    // MAIN( * )(NUMBERING)
    // (SUB)( * )(NUMBERING)( : )(SUB)

    // Titre
    // Série * Tome X

    // Titre * Tome X

    // Titre, sous-titre

    // Titre
    // Tome X : sous-titre

    return (
        <Box>
            <Typography variant="h5" component="span" style={{fontStyle: 'italic'}}>
                {main}
            </Typography>
            {numbering && !sub && <Typography component="span" variant="h5"> · {numbering}</Typography>}
            <Box>
                {sub && <Typography component="span" variant="h6">{sub}</Typography>}
            </Box>
        </Box>
    );
};
