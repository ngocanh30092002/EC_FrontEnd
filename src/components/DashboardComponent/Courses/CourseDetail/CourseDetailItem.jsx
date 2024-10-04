import React, { useCallback, useEffect, useState } from 'react'
import CourseDetailLecture from './CourseDetailLecture';
import CourseDetailIntro from './CourseDetailIntro';
import { appClient } from '~/AppConfigs';

function CourseDetailItem({ course }) {
    const [enroll, setEnroll] = useState(null);
    
    const getEnroll = useCallback(async () =>{
        try{
            var response = await appClient.get(`api/enrolls/courses/${course.courseId}`)
            var data = response.data;
            console.log(response.data);
            if(data.success){
                setEnroll(data.message);
            }
        }
        catch{

        }
    })

    console.log(enroll);

    useEffect(() =>{
        getEnroll();
    },[])

    return (
        <div className='grid grid-cols-12 min-h-full gap-[15px] mx-[20px] mb-[10px]'>
            <div className='col-span-12 md:col-span-4 md:order-2'>
                <CourseDetailIntro course = {course} status={enroll?.enrollStatus}/>
            </div>

            <div className='col-span-12 md:col-span-8 md:order-1'>
                <CourseDetailLecture course={course} status = {enroll?.enrollStatus}/>
            </div>
        </div>
    )
}

export default CourseDetailItem