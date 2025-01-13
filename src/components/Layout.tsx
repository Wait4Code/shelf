import React, {useContext} from "react";
import {AppBar, IconButton, Toolbar} from "@mui/material"
import {Outlet, useNavigate} from "react-router-dom";
import {NavigationBar} from "./NavigationBar";
import {HeaderContext} from "../stores/header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Offset} from "./Offset";

export const Layout = () => {
    const navigate = useNavigate();
    const {headerStyles, toolbarStyles, content} = useContext(HeaderContext);

    return <>
        <AppBar position="fixed" sx={headerStyles}>
            <Toolbar sx={toolbarStyles}>
                <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
                    <ArrowBackIcon/>
                </IconButton>
                {content}
            </Toolbar>
        </AppBar>
        <main>
            <Offset/>
            <Outlet/>
            <Offset/>
        </main>
        <NavigationBar/>
    </>
}
