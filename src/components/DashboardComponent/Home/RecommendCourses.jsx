import { useCallback, useEffect, useState } from 'react';
import './RecommendStyle.css';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant';

function RecommendCourses() {
    const [courses, setCourses] = useState([]);

    const getCourses = useCallback(async () =>{
        try{    
            const response = await appClient.get("api/courses");
            const data = response.data;
            
            if(data.success){
                console.log(data.message);
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
        <div className="recommend-courses__wrapper">
            <div className="rc__header flex justify-between items-center mb-[10px]">
                <div className='rc__header-text'>Recommend for you</div>

                <button className='rc__header-button'>See All</button>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-[15px] py-[10px] px-[5px]'>
               {courses.map((item,index) => <CourseItem key={index} itemInfo = {item} />)}
            </div>
        </div>
    );
}

function CourseItem({itemInfo}){
    const defaultImage = IMG_URL_BASE + "user_image.jpg";


    return (
        <div className='rc__item-wrapper'>
            <div className='rc__item-img'>
                <img src={itemInfo?.imageUrl ? APP_URL + itemInfo.imageUrl : defaultImage} alt='image-course' />
            </div>

            <div className='rc__item-body'>
                <span className='rc__item--title'>{itemInfo.name}</span>
                <span className='rc__item--des line-clamp-2'>{itemInfo.description}</span>
            </div>

            <div className='rc__item-extra flex items-center justify-between'>
                <div className='flex items-center '>
                    <div className='rc__extra-sub-item'>
                        <img src={IMG_URL_BASE + "bar-chart.svg"} alt='bar-icon' className='w-[14px]'/>
                        <span className='rc__extra--des'>{itemInfo.courseId}</span>
                    </div>
                    <div className='rc__extra-sub-item ml-[20px]'>
                        <i className="fa-regular fa-hourglass-half text-orange-500"></i>
                        <span className='rc__extra--des'>6 houres</span>
                    </div>
                </div>

                <div className='rc__extra-sub-item'>
                    <span className='rc__extra--des'>{itemInfo.numLesson} Lessons</span>
                </div>

            </div>
        </div>
    )
}

export default RecommendCourses;