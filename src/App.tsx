import React from 'react';
import {Container} from '@mui/material';
import {BarcodeScanner} from './pages/BarcodeScanner';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Homepage} from "./pages/Homepage";
import {Routes as AppRoutes} from "./utils/routes";
import {ValidationPage} from "./pages/ValidationPage";
import {useBarcodeStore} from "./stores/barcodeStore";


const App: React.FC = () => {
    const barcodes = useBarcodeStore(state => state.barcodes);



    return (
        <Container>
            <BrowserRouter>
                <Routes>
                    <Route path={AppRoutes.Homepage} Component={Homepage}/>
                    <Route path={AppRoutes.Scan} Component={BarcodeScanner}/>
                    {barcodes.length > 0 && <Route path={AppRoutes.Validation} Component={ValidationPage}/>}
                </Routes>
            </BrowserRouter>
        </Container>
    );
};

export default App;
