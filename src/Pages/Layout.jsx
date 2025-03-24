import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Components/Navigation/Sidebar'
import Header from '../Components/Navigation/Header'

const Layout = () => {
    const [toggled, setToggled] = useState(false);

    return (
        <div className='flex h-full w-full'>
            <Sidebar toggled={toggled} setToggled={setToggled} />
            <div className='flex w-full h-full overflow-auto relative'>
                <Header toggled={toggled} setToggled={setToggled} />
                <div className='content-body bg-gray-100 flex overflow-hidden justify-center items-center max-w-full w-full h-full'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout