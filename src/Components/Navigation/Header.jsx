import { AppBar, IconButton, Toolbar } from '@mui/material'
import Logo from "../../assets/logos/logo_sjl.png"
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react'

const Header = ({ toggled, setToggled }) => {
    return (

        <AppBar sx={{ boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05);', display: { md: 'none' } }} className='top-0 shadow-sm' position='sticky' color="inherit">
            <Toolbar className='flex justify-between'>
                <img src={Logo} className='h-10' height={40} alt="Logo" />
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={() => setToggled(!toggled)}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}

export default Header