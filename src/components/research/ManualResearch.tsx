import React from 'react';
import {debounce} from '@mui/material/utils';
import {searchBNFDocument} from "../../utils/libraryDocumentUtils";
import {LibraryDocumentInterface} from "../../types";
import {Autocomplete, AutocompleteProps, ListItem, SxProps, Theme} from "@mui/material";
import {DocumentItem} from "../DocumentItem";

interface ManualResearchProps {
    callback: (value: LibraryDocumentInterface | null) => void;
    containerStyles?: SxProps<Theme>;
    renderInput: AutocompleteProps<never, never, never, never, never>['renderInput'];
}

export const ManualResearch: React.FC<ManualResearchProps> = ({callback, containerStyles = {}, renderInput}) => {
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
            sx={containerStyles}
            getOptionLabel={option =>
                typeof option === 'string' ? option : option.title
            }
            filterOptions={x => x}
            options={options}
            autoComplete
            fullWidth
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
            }}
            renderInput={renderInput}
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
