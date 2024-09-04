import React from 'react'
import { homeComponents, settingComponents, studyComponents } from '../SideBarInfo';
import { Route, Routes} from 'react-router-dom';


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
        </Routes>
    </div>
  )
}

export default MainDashboard