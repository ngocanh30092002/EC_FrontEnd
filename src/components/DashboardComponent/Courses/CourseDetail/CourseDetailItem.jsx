import React from 'react'
import CourseDetailLecture from './CourseDetailLecture';
import CourseDetailIntro from './CourseDetailIntro';

function CourseDetailItem({ course }) {
    return (
        <div className='grid grid-cols-12 min-h-full gap-[15px] mx-[20px] mb-[10px]'>
            <div className='col-span-8 '>
                <CourseDetailLecture course={course}/>
            </div>
            <div className='col-span-4'>
                <CourseDetailIntro course = {course}/>
            </div>
        </div>
    )
}

export default CourseDetailItem