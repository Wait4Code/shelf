// src/App.tsx
import React from 'react';
import {Container} from '@mui/material';
import {BarcodeScanner} from './pages/BarcodeScanner';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Homepage} from "./pages/Homepage";
import {Routes as AppRoutes} from "./utils/routes";
import {ValidationPage} from "./pages/ValidationPage";

const App: React.FC = () => {
    return (
        <Container>
            <BrowserRouter>
                <Routes>
                    <Route path={AppRoutes.Homepage} Component={Homepage}/>
                    <Route path={AppRoutes.Scan} Component={BarcodeScanner}/>
                    <Route path={AppRoutes.Validation} Component={ValidationPage}/>
                </Routes>
            </BrowserRouter>
        </Container>
    );
};

export default App;
