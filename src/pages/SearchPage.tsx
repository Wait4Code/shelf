// src/pages/SearchPage.tsx
import React, {useEffect, useState} from 'react';
import {
    alpha,
    AppBar,
    Box,
    IconButton,
    InputBase,
    List,
    ListItem,
    styled,
    SxProps,
    Theme,
    Toolbar,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {useNavigate} from 'react-router-dom';
import {useSearchStore} from '../stores/searchStore';
import {searchBNFDocument} from '../utils/libraryDocumentUtils';
import {DocumentItem} from '../components/DocumentItem';
import {LibraryDocument} from "../types";
import {BarcodeScanner} from "../components/BarcodeScanner";


type Styles = {
    [key: string]: SxProps<Theme>
}

const useStyles: Styles = {
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    appbar: {
        zIndex: 10000,
    },
    resultsContainer: theme => {
        const base = {
            position: 'absolute',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            zIndex: 10001,
            padding: '16px',
            bottom: '56px',
            overflowY: 'auto',
        };

        const setupTopValues = (pieceOfTheme: object) => {
            const newTheme: Styles = {};
            for (const [key, value] of Object.entries(pieceOfTheme)) {
                let newValue = value;
                if (typeof value === 'object') {
                    newValue = setupTopValues(value);
                }
                if (key === 'minHeight') {
                    newTheme['top'] = newValue;
                } else {
                    newTheme[key] = newValue;
                }
            }
            return newTheme;
        }

        return {
            ...base,
            ...setupTopValues(theme.mixins.toolbar)
        };
    },
    resultItem: {
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

    const closeManualSearch = () => {
        setIsSearching(!isSearching);
        setSearchResults([]);
        setSearchQuery('');
    }

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
                                fullWidth={true}
                                placeholder="Rechercher un livre..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                                // onKeyUp={event => event.}
                            />
                        </Search>
                    ) : (
                        <Typography variant="h6">
                            {searchCount() > 0 ? `Livres recherchés : ${searchCount()}` : 'Recherche de livres'}
                        </Typography>
                    )}
                    <IconButton edge="end" color="inherit" onClick={closeManualSearch}>
                        {isSearching ? <CloseIcon/> : <SearchIcon/>}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <BarcodeScanner/>
            {searchResults.length > 0 && (
                <Box sx={useStyles.resultsContainer}>
                    {searchResults.length > 0 && (
                        <List>
                            {searchResults.map(result => (
                                <ListItem key={result.arkIdentifier} sx={useStyles.resultItem}
                                          onClick={() => pickResult(result)}>
                                    <DocumentItem document={result}/>
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {searchResults.length === 0 && searchQuery && (
                        <Typography>Aucun document trouvé pour "{searchQuery}"</Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};
