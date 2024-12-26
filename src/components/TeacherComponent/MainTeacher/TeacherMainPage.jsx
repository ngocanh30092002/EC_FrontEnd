import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Notification from '../../DashboardComponent/Notification/Notification'
import { teacherComponents, teacherLastComponents, teacherMiddleComponents } from '../../DashboardComponent/SideBarInfo'

function TeacherMainPage() {
    return (
        <div className="flex-1 relative">
            <Notification className={"fixed z-[998] w-full right-0 top-0 md:static"} title={"Welcome back to Teacher Page"} mode={2} />

            <div className={"w-full overflow-visible"}>
                <Routes>
                    {teacherComponents.map((item, index) => {
                        return <Route key={index} path={item.link} element={item.component} />
                    })}

                    {teacherMiddleComponents.map((item, index) => {
                        return <Route key={index} path={item.link} element={item.component} />
                    })}

                    {teacherLastComponents.map((item, index) => {
                        return <Route key={index} path={item.link} element={item.component} />
                    })}

                    <Route path='*' element={<Navigate to="/not-found" />} />
                </Routes>
            </div>
        </div>
    )
}

export default TeacherMainPage