// src/App.tsx
import React from 'react';
import {BrowserRouter, Route, Routes as RouterRoutes} from "react-router-dom";
import {Homepage} from "./pages/Homepage";
import {LoansPage} from "./pages/LoansPage";
import {SearchPage} from "./pages/SearchPage";
import {ShoppingCartPage} from "./pages/ShoppingCartPage";
import {SearchResultsHandlingPage} from "./pages/SearchResultsHandlingPage";
import {Routes} from "./utils/routes";
import {Layout} from "./components/Layout";
import {HeaderProvider} from './stores/header';

const App: React.FC = () => {
    return (
        <HeaderProvider>
            <BrowserRouter>
                <RouterRoutes>
                    <Route path={''} element={<Layout/>}>
                        <Route path={Routes.home} Component={Homepage}/>
                        <Route path={Routes.library} Component={Homepage}/>
                        <Route path={Routes.research} Component={SearchPage}/>
                        <Route path={Routes.research_results} Component={SearchResultsHandlingPage}/>
                        <Route path={Routes.shoppingCart} Component={ShoppingCartPage}/>
                        <Route path={Routes.loans} Component={LoansPage}/>
                    </Route>
                </RouterRoutes>
            </BrowserRouter>
        </HeaderProvider>
    );
};

export default App;
