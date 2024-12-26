import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CourseListBoard from './CourseListBoard'
import CourseMainDetail from './CourseMainDetail/CourseMainDetail'
import "./CourseStyle.css";

function CoursePageAdmin() {
    return (
        <Routes>
            <Route path={"/"} element = {<CourseListBoard/>}/>
            <Route path="/:courseId/detail/*" element={<CourseMainDetail/>}/>
        </Routes>
    )
}

export default CoursePageAdmin