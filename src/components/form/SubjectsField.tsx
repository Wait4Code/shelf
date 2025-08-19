import React from "react";
import {Box, Button, TextField} from "@mui/material";
import {FieldArray, useField, useFormikContext} from "formik";

export type SubjectsFieldProps = Readonly<{ name: string; visibleSubFields?: string[] }>;

const SubjectItem: React.FC<{ baseName: string; onRemove: () => void; visibleSubFields?: string[] }> = ({baseName, onRemove, visibleSubFields}) => {
    const [titleField, titleMeta] = useField(`${baseName}.title`);
    const [identifierField, identifierMeta] = useField(`${baseName}.identifier`);
    const [clarificationField, clarificationMeta] = useField(`${baseName}.clarification`);
    const [subjectSubdivisionField, subjectSubdivisionMeta] = useField(`${baseName}.subjectSubdivision`);
    const [geographicSubdivisionField, geographicSubdivisionMeta] = useField(`${baseName}.geographicSubdivision`);
    const [chronologicalSubdivisionField, chronologicalSubdivisionMeta] = useField(`${baseName}.chronologicalSubdivision`);
    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);

    return (
        <Box sx={{mb: 2, pl: 2}}>
            {show('title') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Sujet"} error={titleMeta.touched && Boolean(titleMeta.error)} helperText={titleMeta.touched && titleMeta.error} {...titleField}/>)}
            {show('identifier') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Identifiant"} error={identifierMeta.touched && Boolean(identifierMeta.error)} helperText={identifierMeta.touched && identifierMeta.error} {...identifierField}/>)}
            {show('clarification') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Précision"} error={clarificationMeta.touched && Boolean(clarificationMeta.error)} helperText={clarificationMeta.touched && clarificationMeta.error} {...clarificationField}/>)}
            {show('subjectSubdivision') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Subdivision de sujet"} error={subjectSubdivisionMeta.touched && Boolean(subjectSubdivisionMeta.error)} helperText={subjectSubdivisionMeta.touched && subjectSubdivisionMeta.error} {...subjectSubdivisionField}/>)}
            {show('geographicSubdivision') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Subdivision géographique"} error={geographicSubdivisionMeta.touched && Boolean(geographicSubdivisionMeta.error)} helperText={geographicSubdivisionMeta.touched && geographicSubdivisionMeta.error} {...geographicSubdivisionField}/>)}
            {show('chronologicalSubdivision') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Subdivision chronologique"} error={chronologicalSubdivisionMeta.touched && Boolean(chronologicalSubdivisionMeta.error)} helperText={chronologicalSubdivisionMeta.touched && chronologicalSubdivisionMeta.error} {...chronologicalSubdivisionField}/>)}
            <Button variant="text" color="secondary" onClick={onRemove}>Supprimer ce sujet</Button>
        </Box>
    );
}

export const SubjectsField: React.FC<SubjectsFieldProps> = ({name, visibleSubFields}) => {
    const {values} = useFormikContext<Record<string, any>>();
    const current = (values as any)[name] as any[];

    return (
        <FieldArray name={name}>
            {({push, remove}) => (
                <Box>
                    {current?.map((_, index) => (
                        <SubjectItem key={index} baseName={`${name}.${index}`} onRemove={() => remove(index)} visibleSubFields={visibleSubFields} />
                    ))}
                    <Button variant="outlined" onClick={() => push({title: '', identifier: null, clarification: null, subjectSubdivision: null, geographicSubdivision: null, chronologicalSubdivision: null})}>Ajouter un sujet</Button>
                </Box>
            )}
        </FieldArray>
    );
}
