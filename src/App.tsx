// src/App.tsx
import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes as RouterRoutes} from "react-router-dom";
import {SnackbarProvider} from 'notistack';
import {Homepage} from "./pages/Homepage";
import {LoansPage} from "./pages/LoansPage";
import {ScanPage} from "./pages/ScanPage";
import {SearchPage} from "./pages/SearchPage";
import {ShoppingCartPage} from "./pages/ShoppingCartPage";
import {Routes} from "./utils/routes";
import {useSearchStore} from "./stores/searchStore";
import {Layout} from "./components/Layout";
import {HeaderProvider} from './stores/header';

const App: React.FC = () => {
    const {research, addLibraryDocument} = useSearchStore();

    useEffect(() => {
        void research('9782379331862'); // Barbarossa, 1941, la guerre absolue
        void research('9782262105105'); // l'ours et le renard
        void research('9782717866759');
        void research('9782800108582');
        void research('9782847347746');
        void research('9782847347074');
        void research('9782501117166');
        void research('9782501104920');
        void research('9782070457663'); // les décisions absurdes T1
        void research('9782070456239'); // les décisions absurdes T2
        void research('9782072729096'); // les décisions absurdes T3
        void research('9791040400875'); // barbarossa 2eme edition
        void research('9782709643740'); // inferno
        void research('9798377302445'); // d.brief
        void research('9791095598114'); // sortir de l'ombre - romans
        void research('3781710305957'); // guerre & histoire - n1
        void research('9782262068257'); // infographie
        void research('9791033511960'); // carbone & silicium
        void research('3782924705908'); // niépi - n1
    }, [research, addLibraryDocument])


    return (
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <HeaderProvider>
                <BrowserRouter>
                    <RouterRoutes>
                        <Route path={''} element={<Layout/>}>
                            <Route path={Routes.home} Component={Homepage}/>
                            <Route path={Routes.library} Component={Homepage}/>
                            <Route path={Routes.research} Component={SearchPage}/>
                            <Route path={Routes.research_scan} Component={ScanPage}/>
                            <Route path={Routes.shoppingCart} Component={ShoppingCartPage}/>
                            <Route path={Routes.loans} Component={LoansPage}/>
                        </Route>
                    </RouterRoutes>
                </BrowserRouter>
            </HeaderProvider>
        </SnackbarProvider>
    );
};

export default App;
