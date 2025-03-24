import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Logo from "../../assets/logos/logo_sjl.png";
import { Fragment, useState } from 'react';
import { Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VideocamIcon from '@mui/icons-material/Videocam'; // Nuevo icono para Control de Bodycam
import StorageIcon from '@mui/icons-material/Storage'; // Nuevo icono para Base de Datos

const Sidebar = ({ toggled, setToggled }) => {
  const [Collapsed, setCollapsed] = useState(false);

  const MenuItems = [
    {
      id: 1,
      label: 'Dashboard',
      icon: DashboardIcon,
      link: '/',
      target: '_self'
    },
    {
      id: 2,
      label: 'Control de Bodycam',
      icon: VideocamIcon,
      link: '/control_bodycam',
      target: '_self'
    },
    {
      id: 3,
      label: 'Base de Datos',
      icon: StorageIcon,
      link: '/base_datos',
      target: '_self'
    },
  ];

  return (
    <div className='relative h-screen w-max bg-slate-500 z-[1200]'>
      <ProSidebar
        backgroundColor='#ffffff'
        className='shadow h-full'
        breakPoint='md'
        collapsed={Collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        rootStyles={{
          color: themes.light.sidebar.color,
        }}
      >
        <Link to={"/"} className='flex justify-center items-center h-[90px]' style={{ marginBottom: '24px', marginTop: '16px' }}>
          <img src={Logo} alt="Logo reducido" className='w-full max-w-[230px]' />
        </Link>
        {
          MenuItems.map((item) => (
            <Menu key={item.id} menuItemStyles={menuItemStyles}>
              <MenuItem component={<Link to={item.link} target={item.target} />} icon={<item.icon />}>
                {item.label}
              </MenuItem>
            </Menu>
          ))
        }
      </ProSidebar>
      <div
        className='justify-center items-center absolute cursor-pointer top-[100px] right-[-10px] rounded-full h-6 w-6 bg-[#0098e5] text-white z-10 hidden md:flex'
        onClick={() => setCollapsed(!Collapsed)}
      >
        <ChevronRightRoundedIcon
          className={`transition-transform duration-300 ${Collapsed ? '' : 'rotate-180'}`}
        />
      </div>
    </div>
  );
};

export default Sidebar;

const themes = {
  light: {
    sidebar: {
      backgroundColor: '#ffffff',
      color: '#607489',
    },
    menu: {
      menuContent: '#fbfcfd',
      icon: '#0098e5',
      hover: {
        backgroundColor: '#c5e4ff',
        color: '#44596e',
      },
      disabled: {
        color: '#9fb6cf',
      },
    },
  },
};

const menuItemStyles = {
  root: {
    fontSize: '13px',
    fontWeight: 400,
  },
  icon: {
    color: themes.light.menu.icon,
  },
  button: {
    '&:hover': {
      backgroundColor: themes.light.menu.hover.backgroundColor,
      color: themes.light.menu.hover.color,
    },
  },
  label: {
    fontWeight: 600,
  },
};
