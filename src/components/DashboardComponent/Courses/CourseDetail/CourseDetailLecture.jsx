import React, { useCallback, useContext, useEffect, useState } from 'react'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import CourseLectureList from './CourseLectureList';
import { CourseDetailItemContext } from './CourseDetailItem';

function CourseDetailLecture() {
    const [contents, setContents] = useState([]);
    const {dataContext} = useContext(CourseDetailItemContext);
    console.log(dataContext);
    const course = dataContext.course;

    const getCourseContents = useCallback( async (enrollId) =>{
        try{
            if(enrollId == null){
                const response = await appClient.get(`api/coursecontent/course/${course.courseId}`);
                const data = response.data;
    
                if(data.success){
                    setContents(data.message);
                }
            }
            else{
                const response = await appClient.get(`api/coursecontent/course/${course.courseId}/enroll/${enrollId}`)
                const data = response.data;
    
                if(data.success){
                    setContents(data.message);
                }
            }
        }
        catch(error){
        }
    }, [])

    useEffect(() => {
        getCourseContents(dataContext?.enroll?.enrollId);
    }, [dataContext.enroll])

    useEffect(() =>{
        // console.log("handle status");
    }, [dataContext?.enroll?.enrollStatus])

    return (
        <div className='cdl__wrapper'>
            <div className="cdl__course--intro">
                <div className="cdl__course--name">{course.name}</div>
                <div className="cdl__course--des">{course.description}</div>
            </div>

            <div className="cdl__course--target mt-[10px]">
                <span className="cdl__course--title">What will you learn ?</span>

                <div className='grid grid-cols-2 gap-x-[15px] cdl__ct--list mt-[10px]'>
                    {contents.map((item,index) =>
                        <div className='cdl__ct--item' key={index}>
                            <img src={IMG_URL_BASE + "check-icon-blue.svg"} className='w-[15px]'/>
                            <span className='line-clamp-2'>{item.content}</span>
                        </div>
                    )}

                </div>
            </div>

            <div className="cdl__course--content">
                <div className="cc__title">Course contents</div>
                <div className="cc__overview">
                    <div className="cc__overview-item">
                        Chapters:
                        <span className='cc__overview--special'>{contents.length}</span>
                    </div>
                    <div className="cc__overview-item">
                        Lessons: 
                        <span className='cc__overview--special'>{dataContext.numLessons}</span>
                    </div>
                    <div className="cc__overview-item">
                        Time:
                        <span className="cc__overview--special">
                            {dataContext.hours} hours {dataContext.minutes} minutes 
                        </span>
                    </div>
                </div>
                    

                <div className='cdl__course--list'>
                    <CourseLectureList contents ={contents}/>
                </div>
            </div>
                    
        </div>
    )
}

export default CourseDetailLecture