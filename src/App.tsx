import React from 'react';
import {Box, Container, Fab} from '@mui/material';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import {BookList} from './components/BookList';
import {BarcodeScanner} from './components/BarcodeScanner';

const useStyles = {
    rotateIcon: {
        transform: 'rotate(90deg)'
    }
}

const App: React.FC = () => {
    const [isScanning, setIsScanning] = React.useState(false);

    const handleScanClick = () => {
        setIsScanning(true);
    };

    return (
        <Container>
            <Box my={4}>
                <h1>Ma Bibliothèque</h1>
                <BookList/>
            </Box>
            {isScanning && (
                <BarcodeScanner onClose={() => setIsScanning(false)}/>
            )}
            <Fab
                color="primary"
                aria-label="add"
                style={{position: 'fixed', bottom: 16, right: 16}}
                onClick={handleScanClick}
            >
                <DocumentScannerIcon sx={useStyles.rotateIcon}/>
            </Fab>
        </Container>
    );
};

export default App;
