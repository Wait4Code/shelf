// src/components/NavigationBar.tsx
import React from 'react';
import {BottomNavigation, BottomNavigationAction, Paper} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {matchPath, NavLink, useLocation} from 'react-router-dom';
import {Routes} from '../utils/routes';
import {useDeviceDetection} from '../hooks/useDeviceDetection';


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
    const {isMobile} = useDeviceDetection();
    const routeMatch = useRouteMatch([Routes.research, Routes.research, Routes.shoppingCart, Routes.loans, Routes.home]);
    const currentTab = routeMatch?.pattern?.path;
    
    // Déterminer la route de recherche selon le type d'appareil
    const researchRoute = isMobile ? Routes.research_scan : Routes.research;
    
    return (
        <Paper sx={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000}} elevation={3}>
            <BottomNavigation showLabels value={currentTab}>
                <BottomNavigationAction label="Bibliothèque" icon={<LibraryBooksIcon/>} to={Routes.library}
                                        value={Routes.home} component={NavLink}/>
                <BottomNavigationAction label="Recherche" icon={<SearchIcon/>} to={researchRoute}
                                        value={isMobile ? Routes.research_scan : Routes.research} component={NavLink}/>
                <BottomNavigationAction label="Liste d'achats" icon={<ShoppingCartIcon/>} to={Routes.shoppingCart}
                                        value={Routes.shoppingCart} component={NavLink}/>
                <BottomNavigationAction label="Prêts" icon={<SwapHorizIcon/>} to={Routes.loans}
                                        value={Routes.loans} component={NavLink}/>
            </BottomNavigation>
        </Paper>
    );
};
