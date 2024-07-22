import {BookList} from "./BookList";
import {Box, Fab} from "@mui/material";
import React from "react";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import {useNavigate} from "react-router-dom";
import {Routes} from "../utils/routes";

const useStyles = {
    rotateIcon: {
        transform: 'rotate(90deg)'
    }
}


export const Homepage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <>
            <Box my={4}>
                <h1>Ma Bibliothèque</h1>
                <BookList/>
            </Box>

            <Fab
                color="primary"
                aria-label="add"
                style={{position: 'fixed', bottom: 16, right: 16}}
                onClick={() => navigate(Routes.Scan)}
            >
                <DocumentScannerIcon sx={useStyles.rotateIcon}/>
            </Fab>
        </>
    )
}
