import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import CourseDetailItem from './CourseDetailItem';
import "./CourseDetailStyle.css";
function CourseDetailPage() {
    const [courses, setCourses] = useState([]);

    useState(() => {
        const getCourses = async () => {
            try{
                const response = await appClient.get("api/courses")
                const data = response.data;
                if(data.success){
                    setCourses(data.message);
                }
            }
            catch(error){

            }
        }

        getCourses();
    }, [])
    return (
        <Routes>
            {courses.map((item,index) => 
                <Route 
                    path ={ item.courseId.toLowerCase() } 
                    key={index}
                    element = {<CourseDetailItem course= {item}/>}/>
            )}
        </Routes>
    )
}

export default CourseDetailPage