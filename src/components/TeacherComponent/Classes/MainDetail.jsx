import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ClassMainContext } from './ClassDetailPage';

function MainDetail({className}) {
    const detailData = useContext(ClassMainContext);

    return (
        <div className={`${className} border-l`}>
            <Routes>
                {
                    detailData.map((item, index) => {
                        return (
                            <Route path={item.link} element={item.component} key={index} />
                        )
                    })
                }
            </Routes>
        </div>
    )
}

export default MainDetail