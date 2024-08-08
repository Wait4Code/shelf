// src/App.tsx
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Homepage} from "./pages/Homepage";
import {Routes as AppRoutes} from "./utils/routes";
import {ValidationPage} from "./pages/ValidationPage";
import {SearchPage} from "./pages/SearchPage";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={AppRoutes.Homepage} Component={Homepage}/>
                <Route path={AppRoutes.Search} Component={SearchPage}/>
                <Route path={AppRoutes.Validation} Component={ValidationPage}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
