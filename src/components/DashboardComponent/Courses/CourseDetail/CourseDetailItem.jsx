import React, { createContext, useCallback, useEffect, useState } from 'react';
import { appClient } from '~/AppConfigs';
import CourseDetailIntro from './CourseDetailIntro';
import CourseDetailLecture from './CourseDetailLecture';

export const CourseDetailItemContext = createContext();

function CourseDetailItem({ course }) {
    const [dataContext, setDataContext] = useState({course});

    const getNumberAssignments = useCallback(async () => {
        try {
            const response = await appClient.get(`api/coursecontent/course/${course.courseId}/total-num`)
            const data = response.data;

            if (data.success) {
                setDataContext(preData =>{
                    return {
                        ...preData,
                        numLessons: data.message,
                    }
                });
            }
        }
        catch (error) {
        }
    }, [])

    const getTotalTime = useCallback(async () => {
        try {
            const response = await appClient.get(`api/coursecontent/course/${course.courseId}/total-time`)
            const data = response.data;

            if (data.success) {
                var [hours, minutes] = data.message.split(":");
                setDataContext(preData =>{
                    return {
                        ...preData,
                        hours,
                        minutes
                    }
                });
            }
        }
        catch (error) {
        }
    }, [])

    const getEnroll = useCallback(async () => {
        try {
            var response = await appClient.get(`api/enrolls/courses/${course.courseId}`)
            var data = response.data;
            if (data.success) {
                setDataContext(preData =>{
                    return {
                        ...preData,
                        enroll: data.message
                    }
                });
            }
        }
        catch {

        }
    })


    useEffect(() => {
        getEnroll();
        getNumberAssignments();
        getTotalTime();
    }, [])

    return (
        <CourseDetailItemContext.Provider value={{dataContext, setDataContext}} >
            <div className='grid grid-cols-12 min-h-full gap-[15px] mx-[20px] mb-[10px]'>
                <div className='col-span-12 md:col-span-4 md:order-2'>
                    <CourseDetailIntro />
                </div>

                <div className='col-span-12 md:col-span-8 md:order-1'>
                    <CourseDetailLecture />
                </div>
            </div>
        </CourseDetailItemContext.Provider>
    )
}

export default CourseDetailItem