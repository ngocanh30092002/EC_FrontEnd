import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import AdminPage from '../../AdminComponent/AdminPage';
import TeacherPage from '../../TeacherComponent/TeacherPage';
import { homeComponents, settingComponents, studyComponents } from '../SideBarInfo';


function MainDashboard({ className }) {
    const [roles, setRoles] = useState([]);

    const getCurrentRoles = async () => {
        try {
            const response = await appClient.get("api/roles/user");
            const dataRes = response.data;
            if (dataRes.success) {
                setRoles(dataRes.message);
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getCurrentRoles();
    }, [])

    return (
        <div className={className}>
            <Routes>
                {homeComponents.map((item, index) => {
                    return <Route key={index} path={item.link} element={item.component} />
                })}

                {studyComponents.map((item, index) => {
                    return <Route key={index} path={item.link} element={item.component} />
                })}

                {settingComponents.map((item, index) => {
                    return <Route key={index} path={item.link} element={item.component} />
                })}
                {
                    roles.some(r => r == "Admin") && <Route path='admin/*' element={<AdminPage />} />
                }
                <Route path='*' element={<Navigate to="/not-found" />} />
            </Routes>
        </div>
    )
}

export default MainDashboard