import React, {ChangeEvent} from 'react';
import {CompetingDocumentsInterface} from "../stores/searchStore";
import {Box, Checkbox, Radio, RadioGroup, Chip, CircularProgress} from "@mui/material";
import {DocumentItem} from "./DocumentItem";
import {LibraryDocumentInterface} from "../types";
import {NotFoundItem} from "./research/NotFoundItem";

type ResearchItemProps = {
    documents: CompetingDocumentsInterface;
    identifiers: Array<string>;
    onSelected: (identifiers: Array<string>, document: LibraryDocumentInterface | null) => void;
    isDocumentAlreadyInLibrary: (document: LibraryDocumentInterface) => boolean;
    isRefreshing?: boolean;
};

const useStyles = {
    resultItem: {
        marginLeft: '16px',
        padding: '8px',
        borderLeft: '2px solid gray',
    },
}

export const ResearchItem: React.FC<ResearchItemProps> = ({documents, identifiers, onSelected, isDocumentAlreadyInLibrary, isRefreshing = false}) => {
    const [disabledCheckbox, setDisabledCheckbox] = React.useState(documents.length > 1);
    const [checked, setChecked] = React.useState(false);

    const [currentDocument, setCurrentDocument] = React.useState<LibraryDocumentInterface | null>(documents.length === 1 ? documents[0] : null);

    // Vérifier si au moins un document de cette recherche existe déjà dans la bibliothèque
    const hasDocumentInLibrary = documents.some(document => isDocumentAlreadyInLibrary(document));

    const selectDocument = ({target: {value}}: ChangeEvent<HTMLInputElement>) => {
        setCurrentDocument(documents[parseInt(value, 10)]);
        setDisabledCheckbox(false);
        if (checked) {
            onSelected(identifiers, documents[parseInt(value, 10)])
        }
    }

    const selectItem = () => {
        if (!checked) {
            onSelected(identifiers, currentDocument)
            setChecked(true);
        } else {
            onSelected(identifiers, null)
            setChecked(false)
        }

    }

    if (documents.length === 0) {
        return <NotFoundItem identifiers={identifiers}/>
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox onChange={selectItem} disabled={disabledCheckbox} checked={checked}/>
                {hasDocumentInLibrary && (
                    <Chip 
                        label="Déjà en bibliothèque" 
                        color="success" 
                        size="small"
                        variant="outlined"
                    />
                )}
                {isRefreshing && (
                    <CircularProgress size={16} />
                )}
            </Box>
            {documents.length === 1 ? (
                <Box key={`${identifiers.join('-')}_0`}>
                    <DocumentItem document={documents[0]}/>
                </Box>
            ) : (
                <RadioGroup>
                    {documents.map((document, index) => (
                        <Box key={`${identifiers.join('-')}_${index}`}
                             sx={useStyles.resultItem}>
                            <Radio value={index} onChange={selectDocument}/>
                            <DocumentItem document={document}/>
                        </Box>
                    ))}
                </RadioGroup>


            )}

        </>


    )
}
