// src/components/NavigationBar.tsx
import React from 'react';
import {AppBar, BottomNavigation, BottomNavigationAction} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {useNavigate} from 'react-router-dom';
import {Routes} from '../utils/routes';

export const NavigationBar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="fixed" sx={{top: 'auto', bottom: 0, zIndex: 10000}}>
            <BottomNavigation showLabels>
                <BottomNavigationAction label="Bibliothèque" icon={<LibraryBooksIcon/>}
                                        onClick={() => navigate(Routes.Homepage)}/>
                <BottomNavigationAction label="Recherche" icon={<SearchIcon/>} onClick={() => navigate(Routes.Search)}/>
                <BottomNavigationAction label="Liste d'achats" icon={<ShoppingCartIcon/>}
                                        onClick={() => navigate(Routes.ShoppingCart)}/>
                <BottomNavigationAction label="Prêts" icon={<SwapHorizIcon/>} onClick={() => navigate(Routes.Loans)}/>
            </BottomNavigation>
        </AppBar>
    );
};
