import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CourseListBoard from '../../AdminComponent/Course/CourseListBoard'
import CourseMainDetail from './CourseMainDetail'

function CoursePageTeacher() {
    return (
        <Routes>
            <Route path={"/"} element = {<CourseListBoard isTeacher={true}/>}/>
            <Route path="/:courseId/detail/*" element={<CourseMainDetail/>}/>
        </Routes>
    )
}

export default CoursePageTeacher