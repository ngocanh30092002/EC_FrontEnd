import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant';
import { APP_URL } from '~/GlobalConstant.js';
import { CourseDetailItemContext } from './CourseDetailItem';

function CourseDetailIntro() {
    const {dataContext} = useContext(CourseDetailItemContext);
    const course = dataContext.course;

    const navigate = useNavigate();

    const handleRegisterCourse = () =>{
        const checkIsQualified = async () =>{
            try{
                var response = await appClient.get(`api/courses/${course.courseId}/student/is-qualified`);
                var data = response.data;
                if(data.success){
                    sessionStorage.setItem("CourseId", course.courseId);
                    navigate(`/courses/register`);
                }
            }
            catch{
            }
        }

        checkIsQualified();
    }

    return (
        <div className='flex flex-col items-center cdi__wrapper'>
            <div className='cdi__course--img'>
                <img src={APP_URL + course.imageThumbnailUrl} />
            </div>

            <div className='flex flex-col justify-start items-start w-full px-[10px] mt-[10px]'>
                <div className={course.entryPoint == 0 ? "hidden" : "cdi__require--title"}>Entry point: 
                    <span className='ml-2 cdi__require--point'>
                        {course.entryPoint}
                    </span>
                </div>
                <div className='cdi__require--title mt-1'>
                    Standard point: 
                    <span className='ml-2 cdi__require--point'>
                        {course.standardPoint}+
                    </span>
                </div>
            </div>

            <ul className='cdi__course--list'>
                <li className='cdi__course--item'>
                    <img className='w-[16px]' src={IMG_URL_BASE + "price-icon.svg"} />
                    <span className='cdi__item--title'>Free</span>
                </li>

                <li className='cdi__course--item'>
                    <img className='w-[16px]' src={IMG_URL_BASE + "level-icon.svg"} />
                    <span className='cdi__item--title'>{course.courseId}</span>
                </li>

                <li className='cdi__course--item'>
                    <img className='w-[16px]' src={IMG_URL_BASE + "video-icon.svg"} />
                    <span className='cdi__item--title'>Total: {dataContext.numLessons} lessons</span>
                </li>

                <li className='cdi__course--item'>
                    <img className='w-[16px]' src={IMG_URL_BASE + "clock-icon.svg"} />
                    <span className='cdi__item--title'>{dataContext.hours} hours {dataContext.minutes} minutes</span>
                </li>

                <li className='cdi__course--item'>
                    <img className='w-[16px]' src={IMG_URL_BASE + "pin-location-icon.svg"} />
                    <span className='cdi__item--title'>Learn anytime, anywhere</span>
                </li>
            </ul>

            {dataContext?.enroll?.enrollStatus != "Ongoing" && <button className='cdi__course--btn' onClick={handleRegisterCourse}>Register Now</button>}
        </div>
    )
}

export default CourseDetailIntro