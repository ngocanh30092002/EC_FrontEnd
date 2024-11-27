import React from 'react'
import Notification from '../../DashboardComponent/Notification/Notification'

function AdminMainPage() {
    return (
        <div className="flex-1 relative">
            <Notification className={"fixed z-[998] w-full right-0 top-0 md:static"} title={"Welcome back to Admin Page"} mode={1}/>
        </div>
    )
}

export default AdminMainPage