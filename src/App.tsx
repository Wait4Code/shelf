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
                <Route path={''}>
                    <Route path={Routes.home} Component={Homepage}/>
                    <Route path={Routes.library} Component={Homepage}/>
                    <Route path={Routes.research} Component={SearchPage}/>
                    <Route path={Routes.research_results} Component={ValidationPage}/>
                    <Route path={Routes.shoppingCart} Component={ShoppingCartPage}/>
                    <Route path={Routes.loans} Component={LoansPage}/>
                </Route>
            </RouterRoutes>
            <NavigationBar/>
        </BrowserRouter>
    );
};

export default App;
