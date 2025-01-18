// src/pages/SearchPage.tsx
import React, {useContext, useEffect, useState} from 'react';
import {alpha, Box, IconButton, InputBase, SxProps, Theme, Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {useSearchStore} from '../stores/searchStore';
import {LibraryDocument} from "../types";
import {BarcodeScanner} from "../components/BarcodeScanner";
import {HeaderContext} from "../stores/header";
import {ManualResearch} from "../components/research/ManualResearch";


type Styles = {
    [key: string]: SxProps<Theme>
}

const useStyles: Styles = {
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    autocompleteContainer: theme => ({
        borderRadius: 1,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
    }),
    autocompleteInput: {
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: 1,
        },
    }
};

export const SearchPage: React.FC = () => {
    const [isSearching, setIsSearching] = useState(false);
    const {count: searchCount, addLibraryDocument} = useSearchStore();
    const {setHeaderStyles, setToolbarStyles, setContent} = useContext(HeaderContext);


    useEffect(() => {
        const pickResult = (result: LibraryDocument | null) => {
            if (!result) {
                return;
            }
            void addLibraryDocument(result);
            setIsSearching(false);
        };


        setToolbarStyles(useStyles.toolbar);

        setContent(<>
            {isSearching ? (
                <ManualResearch callback={pickResult} containerStyles={useStyles.autocompleteContainer}
                                renderInput={params => {
                                    const {InputProps: {ref}} = params;
                                    const inputParams: Partial<typeof params> = params;
                                    delete inputParams["InputLabelProps"]
                                    delete inputParams["InputProps"]

                                    return (
                                        <div ref={ref}>
                                            <InputBase
                                                autoFocus
                                                sx={useStyles.autocompleteInput}
                                                placeholder="Rechercher un livre..." {...inputParams} />
                                        </div>
                                    );
                                }}
                />
            ) : (
                <Typography variant="h6">
                    {searchCount() > 0 ? `Livres recherchés : ${searchCount()}` : 'Recherche de livres'}
                </Typography>
            )}
            <IconButton edge="end" color="inherit" onClick={() => setIsSearching(!isSearching)}>
                {isSearching ? <CloseIcon/> : <SearchIcon/>}
            </IconButton>
        </>)

        return () => {
            setHeaderStyles({});
            setToolbarStyles({});
            setContent(<></>);
        };
    }, [setHeaderStyles, setToolbarStyles, setContent, isSearching, searchCount, addLibraryDocument]);


    return (
        <Box>
            <BarcodeScanner/>
        </Box>
    );
};
