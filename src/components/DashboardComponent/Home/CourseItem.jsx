import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';

function CourseItem({itemInfo, urlBaseLink}){
    const defaultImage = IMG_URL_BASE + "user_image.jpg";
    const [hours, setHours] =  useState();
    const [lessons , setLessons] = useState();

    useEffect(() =>{
        const getTotalTime = async () =>{
            try{
                const response = await appClient.get(`api/assignments/course/${itemInfo.courseId}/total-time`)
                const data = response.data;

                if(data.success){
                    let [hours, minutes] = data.message.split(":");
                    setHours(hours);   
                }
            }
            catch(error){

            }
        }
        
        const getLessons = async() =>{
            try{
                const response = await appClient.get(`api/assignments/course/${itemInfo.courseId}/number`)
                const data = response.data;

                if(data.success){
                    setLessons(data.message);   
                }
            }
            catch(error){

            }
        }

        getTotalTime();
        getLessons();
    }, [])

    return (
        <Link className='rc__item-wrapper' to={ urlBaseLink ? urlBaseLink + "/" + itemInfo.courseId.toLowerCase() : itemInfo.courseId.toLowerCase()}>
            <div className='rc__item-img'>
                <img src={itemInfo?.imageThumbnailUrl ? APP_URL + itemInfo.imageThumbnailUrl : defaultImage} alt='image-course' />
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
                        <span className='rc__extra--des'>{hours} houres</span>
                    </div>
                </div>

                <div className='rc__extra-sub-item'>
                    <span className='rc__extra--des'>{lessons} Lessons</span>
                </div>

            </div>
        </Link>
    )
}

export default CourseItem