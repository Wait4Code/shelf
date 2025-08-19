import React from "react";
import {Box, TextField, Typography} from "@mui/material";
import {useField, useFormikContext} from "formik";

export type CollectionFieldProps = Readonly<{ name: string; visibleSubFields?: string[] }>;

export const CollectionField: React.FC<CollectionFieldProps> = ({name, visibleSubFields}) => {
    const {values, setFieldValue} = useFormikContext<Record<string, any>>();
    const current = (values as any)[name];

    React.useEffect(() => {
        if (current === null) {
            setFieldValue(name, {title: '', recordNumber: '', number: '', issn: '', publicationDate: ''});
        }
    }, [current, name, setFieldValue]);

    const [titleField, titleMeta] = useField(`${name}.title`);
    const [recordNumberField, recordNumberMeta] = useField(`${name}.recordNumber`);
    const [numberField, numberMeta] = useField(`${name}.number`);
    const [issnField, issnMeta] = useField(`${name}.issn`);
    const [dateField, dateMeta] = useField(`${name}.publicationDate`);
    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);

    if (current === null) {
        return (
            <Box>
                <Typography variant="h6">Collection</Typography>
            </Box>
        );
    }



    return (
        <Box>
            <Typography variant="h6">Collection</Typography>
            <Box sx={{pl: 2}}>
                {show('title') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Titre de la collection"} error={titleMeta.touched && Boolean(titleMeta.error)} helperText={titleMeta.touched && titleMeta.error} {...titleField}/>)}
                {show('recordNumber') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Numéro de notice"} error={recordNumberMeta.touched && Boolean(recordNumberMeta.error)} helperText={recordNumberMeta.touched && recordNumberMeta.error} {...recordNumberField}/>)}
                {show('number') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Numéro"} error={numberMeta.touched && Boolean(numberMeta.error)} helperText={numberMeta.touched && numberMeta.error} {...numberField}/>)}
                {show('issn') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"ISSN"} error={issnMeta.touched && Boolean(issnMeta.error)} helperText={issnMeta.touched && issnMeta.error} {...issnField}/>)}
                {show('publicationDate') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Date de publication"} error={dateMeta.touched && Boolean(dateMeta.error)} helperText={dateMeta.touched && dateMeta.error} {...dateField}/>)}
            </Box>
        </Box>
    );
}
