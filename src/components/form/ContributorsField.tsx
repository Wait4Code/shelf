import { FieldArray, useField, useFormikContext } from "formik";
import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";


export type ContributorsFieldProps = Readonly<{
    name: string
    visibleSubFields?: string[]
}>


const ContributorItem: React.FC<{ baseName: string; onRemove: () => void; visibleSubFields?: string[] }> = ({ baseName, onRemove, visibleSubFields }) => {
    const [firstNameField, firstNameMeta] = useField(`${baseName}.firstName`);
    const [lastNameField, lastNameMeta] = useField(`${baseName}.lastName`);
    const [roleField, roleMeta] = useField(`${baseName}.role`);
    const [identifierField, identifierMeta] = useField(`${baseName}.identifier`);

    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);

    return (
        <Box sx={{ mb: 2, pl: 2 }}>
            {show('firstName') && (
                <TextField fullWidth margin={"dense"} variant={"standard"} label={"Prénom"}
                    error={firstNameMeta.touched && Boolean(firstNameMeta.error)}
                    helperText={firstNameMeta.touched && firstNameMeta.error}
                    {...firstNameField} />)}
            {show('lastName') && (
                <TextField fullWidth margin={"dense"} variant={"standard"} label={"Nom"}
                    error={lastNameMeta.touched && Boolean(lastNameMeta.error)}
                    helperText={lastNameMeta.touched && lastNameMeta.error}
                    {...lastNameField} />)}
            {show('role') && (
                <TextField fullWidth margin={"dense"} variant={"standard"} label={"Rôle"}
                    error={roleMeta.touched && Boolean(roleMeta.error)}
                    helperText={roleMeta.touched && roleMeta.error}
                    {...roleField} />)}
            {show('identifier') && (
                <TextField fullWidth margin={"dense"} variant={"standard"} label={"Identifiant"}
                    error={identifierMeta.touched && Boolean(identifierMeta.error)}
                    helperText={identifierMeta.touched && identifierMeta.error}
                    {...identifierField} />)}
            <Button variant="text" color="secondary" onClick={onRemove}>Supprimer ce contributeur</Button>
        </Box>
    );
}

export default function ContributorsField({ name, visibleSubFields }: ContributorsFieldProps) {
    const { values } = useFormikContext<Record<string, any>>();
    const current = (values as any)[name] as any[];

    return (
        <>
            <Typography variant="h6">Contributeurs</Typography>
            <FieldArray name={name}>
                {({ push, remove }) => (
                    <Box>
                        {current?.map((_, index) => (
                            <ContributorItem key={index} baseName={`${name}.${index}`} onRemove={() => remove(index)} visibleSubFields={visibleSubFields} />
                        ))}
                        <Button
                            variant="outlined"
                            type="button"
                            onClick={() => push({ firstName: '', lastName: '', role: null, identifier: null })}
                        >
                            Ajouter un contributeur
                        </Button>
                    </Box>
                )}
            </FieldArray>
        </>
    );
}
