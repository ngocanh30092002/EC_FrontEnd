import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CourseMainContext } from './CourseMainDetail';

function MainDetail({className}) {
    const detailData = useContext(CourseMainContext);
    
    return (
        <div className={`${className} border-l`}>
            <Routes>
                {
                    detailData.map((item,index) =>{
                        return(
                            <Route path = {item.link} element={item.component} key={index}/>
                        )
                    })
                }
            </Routes>
        </div>
    )
}

export default MainDetail