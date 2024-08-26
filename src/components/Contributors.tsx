// src/components/Contributors.tsx
import React from 'react';
import {Box, Typography} from '@mui/material';
import {Contributor} from '../types';

interface DocumentContributorsProps {
    contributors: Contributor[];
}

export const Contributors: React.FC<DocumentContributorsProps> = ({contributors}) => {
    return (
        <Box sx={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
            <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                {contributors.map(contributor => `${contributor.firstName} ${contributor.lastName}`).join(', ')}
            </Typography>
        </Box>
    );
};
