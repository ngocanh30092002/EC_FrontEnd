import React from 'react'
import ClassesContent from './ClassesContent'
import CoursesContent from './CoursesContent'
import "./CourseMainStyles.css";

function CourseMainPage() {
    return (
        <div>
            <ClassesContent/>
            <CoursesContent/>
        </div>
    )
}

export default CourseMainPage