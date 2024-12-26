import React from 'react'
import Notification from '../../DashboardComponent/Notification/Notification'
import { redirectComponents, adminStudyComponents, adminUserComponents } from '../../DashboardComponent/SideBarInfo'
import { Navigate, Route, Routes } from 'react-router-dom'

function AdminMainPage() {
    return (
        <div className="flex-1 relative">
            <Notification className={"fixed z-[998] w-full right-0 top-0 md:static"} title={"Welcome back to Admin Page"} mode={1} />

            <div className={"w-full overflow-visible"}>
                <Routes>
                    {adminUserComponents.map((item, index) => {
                        return <Route key={index} path={item.link} element={item.component} />
                    })}

                    {adminStudyComponents.map((item, index) => {
                        return <Route key={index} path={item.link} element={item.component} />
                    })}

                    {redirectComponents.map((item, index) => {
                        return <Route key={index} path={item.link} element={item.component} />
                    })}

                    <Route path='*' element={<Navigate to="/not-found" />} />
                </Routes>
            </div>
        </div>
    )
}

export default AdminMainPage