import React, { useCallback, useEffect, useState } from 'react'
import CourseContentHeader from './CourseContentHeader'
import CourseItem from '../../Home/CourseItem'
import { appClient } from '~/AppConfigs';

function CoursesContent() {
    const [courses, setCourses] = useState([]);

    const getCourses = useCallback(async () =>{
        try{    
            const response = await appClient.get("api/courses");
            const data = response.data;
            
            if(data.success){
                setCourses(data.message);
            }
        }
        catch(error){

        }
    }, [])

    useEffect(() =>{
        getCourses();
    }, [])

    return (
        <div className='mt-[20px]'>
            <CourseContentHeader/>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-[5px] mx-[15px]'>
                {courses.map((item,index) => 
                    <CourseItem key={index} itemInfo={item} urlBaseLink={"detail"}/>
                )}
                
            </div>
        </div>
    )
}

export default CoursesContent