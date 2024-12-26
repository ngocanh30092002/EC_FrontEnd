import React, { useState } from 'react';
import "./ClassMainPageStyle.css"
import ClassListBroad from './ClassListBroad';
import { Route, Routes } from 'react-router-dom';
import ClassMainDetail from './ClassMainDetail/ClassMainDetail';
function ClassMainPage() {
    return (
        <Routes>
            <Route path={"/"} element={<ClassListBroad />} />
            <Route path={"/:classId/detail/*"} element={<ClassMainDetail/>} />
        </Routes>
    )
}


export default ClassMainPage