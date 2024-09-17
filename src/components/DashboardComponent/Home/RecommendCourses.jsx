import { useCallback, useEffect, useState } from 'react';
import './RecommendStyle.css';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant';
import { Link } from 'react-router-dom'
import CourseItem from './CourseItem';

function RecommendCourses() {
    const [courses, setCourses] = useState([]);
    const [numShow, setNumShow] = useState(3);
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


    const handleSeeAllClick = () =>{
        setNumShow(courses.length);
    }
    return (
        <div className="recommend-courses__wrapper">
            <div className="rc__header flex justify-between items-center mb-[10px]">
                <div className='rc__header-text'>Recommend for you</div>

                <button className='rc__header-button' onClick={handleSeeAllClick}>See All</button>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-[15px] py-[10px] px-[5px]'>
               {courses.slice(0,numShow).map((item,index) => 
                    <CourseItem 
                        key={index}
                        itemInfo = {item}
                        urlBaseLink = "courses/detail" />)
                }
            </div>
        </div>
    );
}

export default RecommendCourses;