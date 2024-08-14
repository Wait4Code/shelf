// src/components/NavigationBar.tsx
import React from 'react';
import {AppBar, BottomNavigation, BottomNavigationAction} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {matchPath, NavLink, useLocation} from 'react-router-dom';
import {Routes} from '../utils/routes';


function useRouteMatch(patterns: readonly string[]) {
    const {pathname} = useLocation();

    for (const pattern of patterns) {
        const possibleMatch = matchPath({path: pattern, end: false}, decodeURI(pathname));
        if (possibleMatch !== null) {
            return possibleMatch;
        }
    }

    return null;
}

export const NavigationBar: React.FC = () => {
    const routeMatch = useRouteMatch([Routes.research, Routes.shoppingCart, Routes.loans, Routes.home]);
    const currentTab = routeMatch?.pattern?.path;
    return (
        <AppBar position="fixed" sx={{top: 'auto', bottom: 0, zIndex: 10000}}>
            <BottomNavigation showLabels value={currentTab}>
                <BottomNavigationAction label="Bibliothèque" icon={<LibraryBooksIcon/>} to={Routes.library}
                                        value={Routes.home} component={NavLink}/>
                <BottomNavigationAction label="Recherche" icon={<SearchIcon/>} to={Routes.research}
                                        value={Routes.research} component={NavLink}/>
                <BottomNavigationAction label="Liste d'achats" icon={<ShoppingCartIcon/>} to={Routes.shoppingCart}
                                        value={Routes.shoppingCart} component={NavLink}/>
                <BottomNavigationAction label="Prêts" icon={<SwapHorizIcon/>} to={Routes.loans}
                                        value={Routes.loans} component={NavLink}/>
            </BottomNavigation>
        </AppBar>
    );
};
