import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { homeComponents, settingComponents, studyComponents } from '../SideBarInfo';


function MainDashboard({className}) {
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

            <Route path='*' element={<Navigate to="/not-found"/>} />
        </Routes>
    </div>
  )
}

export default MainDashboard