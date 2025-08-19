import React from "react";
import {Box,  TextField, Typography} from "@mui/material";
import {useField, useFormikContext} from "formik";

export type PublicationFieldProps = Readonly<{ name: string; visibleSubFields?: string[] }>;

export const PublicationField: React.FC<PublicationFieldProps> = ({name, visibleSubFields}) => {
    const {values, setFieldValue} = useFormikContext<Record<string, any>>();
    const current = (values as any)[name];

    React.useEffect(() => {
        if (current === null) {
            setFieldValue(name, {publisher: '', publicationDate: ''});
        }
    }, [current, name, setFieldValue]);

    const [publisherField, publisherMeta] = useField(`${name}.publisher`);
    const [dateField, dateMeta] = useField(`${name}.publicationDate`);
    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);
    
    if (current === null) {
        return (
            <Box>
                <Typography variant="h6">Publication</Typography>
            </Box>
        );
    }



    return (
        <Box>
            <Typography variant="h6">Publication</Typography>
            <Box sx={{pl: 2}}>
                {show('publisher') && (
                <TextField fullWidth margin={"dense"} variant={"standard"}
                    label={"Éditeur"}
                    error={publisherMeta.touched && Boolean(publisherMeta.error)}
                    helperText={publisherMeta.touched && publisherMeta.error}
                    {...publisherField}
                />)}
                {show('publicationDate') && (
                <TextField fullWidth margin={"dense"} variant={"standard"}
                    label={"Date de publication"}
                    error={dateMeta.touched && Boolean(dateMeta.error)}
                    helperText={dateMeta.touched && dateMeta.error}
                    {...dateField}
                />)}
            </Box>
        </Box>
    );
}
