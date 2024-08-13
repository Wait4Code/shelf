// src/pages/SearchPage.tsx
import React, {useEffect, useState} from 'react';
import {alpha, AppBar, Box, IconButton, InputBase, styled, Toolbar, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {useNavigate} from 'react-router-dom';
import {BarcodeScanner} from '../components/BarcodeScanner';
import {useSearchStore} from '../stores/searchStore';
import {searchBNFDocument} from '../utils/libraryDocumentUtils';
import {LibraryDocument} from '../types';

const useStyles = {
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    appbar: {
        zIndex: 10000
    },
    resultsContainer: {
        position: 'absolute',
        top: '64px',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 10001,
        padding: '16px',
        maxHeight: 'calc(100vh - 64px)',
        overflowY: 'auto',
    },
    resultItem: {
        marginBottom: '16px',
        cursor: 'pointer',
    }
};

const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 1),
    },
}));

export const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LibraryDocument[]>([]);
    const {count: searchCount, addLibraryDocument} = useSearchStore();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                searchBNFDocument(searchQuery).then(setSearchResults);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const pickResult = (result: LibraryDocument) => {
        void addLibraryDocument(result);
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery('');
    };

    return (
        <Box>
            <AppBar position="sticky" sx={useStyles.appbar}>
                <Toolbar sx={useStyles.toolbar}>
                    <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
                        <ArrowBackIcon/>
                    </IconButton>
                    {isSearching ? (
                        <Search>
                            <StyledInputBase
                                placeholder="Rechercher un livre..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </Search>
                    ) : (
                        <Typography variant="h6">
                            {searchCount() > 0 ? `Livres recherchés : ${searchCount()}` : 'Recherche de livres'}
                        </Typography>
                    )}
                    <IconButton edge="end" color="inherit" onClick={() => setIsSearching(!isSearching)}>
                        {isSearching ? <CloseIcon/> : <SearchIcon/>}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <BarcodeScanner/>
            {searchResults.length > 0 && (
                <Box sx={useStyles.resultsContainer}>
                    {searchResults.map(result => (
                        <Box key={result.arkIdentifier} sx={useStyles.resultItem} onClick={() => pickResult(result)}>
                            <Typography variant="h6">{result.title}</Typography>
                            <Typography variant="subtitle1">{result.subtitle}</Typography>
                            <Typography variant="body2">
                                Auteur(s) : {result.contributors
                                .map(contributor => `${contributor.firstName} ${contributor.lastName}`)
                                .join(', ')}
                            </Typography>
                            <Typography variant="body2">
                                Édition : {result.publication?.publisher}, {result.publication?.publicationDate}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};
