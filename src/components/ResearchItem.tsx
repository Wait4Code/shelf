import React, {ChangeEvent} from 'react';
import {CompetingDocumentsInterface} from "../stores/searchStore";
import {Box, Checkbox, Radio, RadioGroup} from "@mui/material";
import {DocumentItem} from "./DocumentItem";
import {LibraryDocumentInterface} from "../types";
import {NotFoundItem} from "./research/NotFoundItem";

interface ResearchItemProps {
    documents: CompetingDocumentsInterface,
    identifiers: Array<string>,
    onSelected: (identifiers: Array<string>, document: LibraryDocumentInterface | null) => void
}

const useStyles = {
    resultItem: {
        marginLeft: '16px',
        padding: '8px',
        borderLeft: '2px solid gray',
    },
}

export const ResearchItem: React.FC<ResearchItemProps> = ({documents, identifiers, onSelected}) => {
    const [disabledCheckbox, setDisabledCheckbox] = React.useState(documents.length > 1);
    const [checked, setChecked] = React.useState(false);

    const [currentDocument, setCurrentDocument] = React.useState<LibraryDocumentInterface | null>(documents.length === 1 ? documents[0] : null);

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
            <Checkbox onChange={selectItem} disabled={disabledCheckbox} checked={checked}/>
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
