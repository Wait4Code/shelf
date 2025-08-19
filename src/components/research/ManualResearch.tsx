import React, { useRef } from 'react';
import {debounce} from '@mui/material/utils';
import {searchBNFDocument} from "../../utils/libraryDocumentUtils";
import {LibraryDocumentInterface} from "../../types";
import {
    Autocomplete,
    AutocompleteProps,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ListItem,
    SxProps,
    Theme
} from "@mui/material";
import {DocumentItem} from "../DocumentItem";
import {LibraryDocumentForm, LibraryDocumentFormRef} from "../form/LibraryDocumentForm";


class CreatableOption {
    readonly title: string;

    constructor(title: string) {
        this.title = title;
    }
}

interface ManualResearchProps {
    callback: (value: LibraryDocumentInterface | null) => void;
    containerStyles?: SxProps<Theme>;
    renderInput: AutocompleteProps<never, never, never, never, never>['renderInput'];
}

export const ManualResearch: React.FC<ManualResearchProps> = ({callback, containerStyles = {}, renderInput}) => {
    const [value, setValue] = React.useState<LibraryDocumentInterface | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly (LibraryDocumentInterface | CreatableOption)[]>([]);
    const [open, setOpen] = React.useState<boolean>(false);
    
    // Ref pour le formulaire
    const formRef = useRef<LibraryDocumentFormRef>(null);

    const handleClose = () => {
        setOpen(false);
    }

    const handleFormSubmit = (formValues: LibraryDocumentInterface) => {
        setOptions([...options, formValues]);
        setValue(formValues);

        // Appeler le callback avec les valeurs du formulaire
        callback(formValues);
        handleClose();
    }

    const handleManualSubmit = () => {
        // Déclencher la soumission du formulaire via la ref
        if (formRef.current) {
            formRef.current.submitForm();
        }
    }

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

        setLoading(true);

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
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [value, inputValue, fetch]);

    return (
        <>
            <Autocomplete
                loading={loading}
                loadingText={"Recherche en cours..."}
                sx={containerStyles}
                getOptionLabel={option =>
                    typeof option === 'string' ? option : option.title
                }
                filterOptions={(currentOptions, params) => {
                    if (params.inputValue !== '' && !loading) {
                        currentOptions.push(new CreatableOption(params.inputValue));
                    }

                    return currentOptions;
                }}
                options={options}
                autoComplete
                fullWidth
                includeInputInList
                filterSelectedOptions
                value={value}
                noOptionsText="Aucun résultat"
                onChange={(_event, newValue: LibraryDocumentInterface | CreatableOption | null) => {
                    if (newValue instanceof CreatableOption) {
                        setTimeout(() => {
                            setOpen(true);
                        })
                        return;
                    }

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

                    if (option instanceof CreatableOption) {
                        return <ListItem {...optionProps} key={"creatable"}>
                            Saisir manuellement "{option.title}"
                        </ListItem>
                    }

                    return (
                        <ListItem {...optionProps} key={option.arkIdentifier}>
                            <DocumentItem document={option}/>
                        </ListItem>

                    );
                }}
            />
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="body">
                <DialogTitle>Saisie manuelle</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Le document n'est pas référencé à la BNF ? Saisissez-le manuellement !
                    </DialogContentText>
                    <LibraryDocumentForm
                        visibleFields={[
                            'title',
                            'subtitle',
                            'contributors', 'contributors.lastName', 'contributors.firstName',
                            'publication',
                            'series', 'series.title', 'series.number',
                            'internationalSerialBookNumbers', 'internationalSerialBookNumbers.number',
                            'europeanArticleNumbers', 'europeanArticleNumbers.number',
                        ]}
                        onSubmit={handleFormSubmit}
                        ref={formRef}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button onClick={handleManualSubmit} variant="contained" color="primary">
                        Ajouter
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
