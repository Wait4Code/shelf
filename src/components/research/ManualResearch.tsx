import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {debounce} from '@mui/material/utils';
import {searchBNFDocument} from "../../utils/libraryDocumentUtils";
import {LibraryDocumentInterface} from "../../types";
import {ListItem} from "@mui/material";
import {DocumentItem} from "../DocumentItem";

interface ManualResearchProps {
    callback: (value: LibraryDocumentInterface | null) => void;
}

export const ManualResearch: React.FC<ManualResearchProps> = ({callback}) => {
    const [value, setValue] = React.useState<LibraryDocumentInterface | null>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly LibraryDocumentInterface[]>([]);


    const fetch = React.useMemo(() =>
            debounce(
                (query: string, postFetch: (results: readonly LibraryDocumentInterface[]) => void) => {
                    searchBNFDocument(query).then(postFetch)
                },
                400,
            ),
        []
    );

    React.useEffect(() => {
        let active = true;


        if (inputValue === '') {
            setOptions(value ? [value] : []);
            return undefined;
        }

        fetch(inputValue, results => {
            if (active) {
                let newOptions: readonly LibraryDocumentInterface[] = [];

                if (value) {
                    newOptions = [value];
                }

                if (results) {
                    newOptions = [...newOptions, ...results];
                }

                setOptions(newOptions);
            }
        });

        return () => {
            active = false;
        };
    }, [value, inputValue, fetch]);

    return (
        <Autocomplete
            getOptionLabel={option =>
                typeof option === 'string' ? option : option.title
            }
            filterOptions={x => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            noOptionsText="Aucun résultat"
            onChange={(_event, newValue: LibraryDocumentInterface | null) => {
                setOptions(newValue ? [newValue, ...options] : options);
                setValue(newValue);
                callback(newValue);
            }}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
                // callback(newInputValue)
            }}
            renderInput={params => (
                <TextField {...params} label="Titre, Auteur, édition, ..." fullWidth variant="standard"/>
            )}
            renderOption={(props, option) => {
                const {key, ...optionProps} = props

                return (
                    <ListItem key={option.arkIdentifier} {...optionProps} sx={{cursor: 'pointer'}}>
                        <DocumentItem document={option}/>
                    </ListItem>

                );
            }}
        />
    );
}
