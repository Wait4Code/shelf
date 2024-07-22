import React from 'react';
import {Container} from '@mui/material';
import {BarcodeScanner} from './components/BarcodeScanner';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Homepage} from "./components/Homepage";
import {Routes as AppRoutes} from "./utils/routes";


const App: React.FC = () => {
    return (
        <Container>
            <BrowserRouter>
                <Routes>
                    <Route path={AppRoutes.Homepage} Component={Homepage}/>
                    <Route path={AppRoutes.Scan} Component={BarcodeScanner}/>
                    {/*<Route path={AppRoutes.Validation}/>*/}
                </Routes>
            </BrowserRouter>
        </Container>
    );
};

export default App;
