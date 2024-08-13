// src/App.tsx
import React from 'react';
import {BrowserRouter, Route, Routes as RouterRoutes} from "react-router-dom";
import {Homepage} from "./pages/Homepage";
import {LoansPage} from "./pages/LoansPage";
import {SearchPage} from "./pages/SearchPage";
import {ShoppingCartPage} from "./pages/ShoppingCartPage";
import {ValidationPage} from "./pages/ValidationPage";
import {NavigationBar} from "./components/NavigationBar";
import {Routes} from "./utils/routes";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <RouterRoutes>
                <Route path={Routes.Homepage} Component={Homepage}/>
                <Route path={Routes.Search} Component={SearchPage}/>
                <Route path={Routes.ShoppingCart} Component={ShoppingCartPage}/>
                <Route path={Routes.Loans} Component={LoansPage}/>
                <Route path={Routes.Validation} Component={ValidationPage}/>
            </RouterRoutes>
            <NavigationBar/>
        </BrowserRouter>
    );
};

export default App;
