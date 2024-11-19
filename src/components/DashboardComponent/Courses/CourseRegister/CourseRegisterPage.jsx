import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import "./CourseRegisterStyle.css"
import CourseBackground from './CourseBackground';
import CourseDetail from './CourseDetail';
import toast from '@/helper/Toast';
function CourseRegisterPage() {
    const navigate = useNavigate();
    const [courseId , setCourseId] = useState(() =>{
        return sessionStorage.getItem("CourseId");
    })
    const [courseInfo, setCourseInfo] = useState();

    const checkIsQualified = useCallback(async () =>{
        try{
            var response = await appClient.get(`api/courses/${courseInfo.courseId}/student/is-qualified`);
            var data = response.data;
            if(data.success){
                let isValid = data.message;
                if(!isValid){
                    navigate(`/courses/detail/${courseInfo.courseId}`);
                }
            }
            
        }
        catch(error){
            navigate("/courses")
        }
    })

    const getCourseInfo = useCallback( async () => {
        try{
            if(courseId == null){
                toast({
                    type: "error",
                    title: "Bad Request",
                    message: "You are not permitted to access this website",
                    duration: 4000
                })

                navigate(`/courses`);
            }

            var response = await appClient.get(`api/courses/${courseId}`);
            var data = response.data;
            if(data.success){
                setCourseInfo(data.message);
            }
        }
        catch(err){
            navigate(`/courses`);
        }
    })

    useEffect(() =>{
        getCourseInfo();
    }, [])

    useEffect(() =>{
        if(courseInfo != null){
            checkIsQualified();
        }
    }, [courseInfo])
    return (
        <div className='cr__wrapper'>
            <CourseBackground course = {courseInfo}/>

            <CourseDetail course = {courseInfo}/>
        </div>
    )
}

export default CourseRegisterPage