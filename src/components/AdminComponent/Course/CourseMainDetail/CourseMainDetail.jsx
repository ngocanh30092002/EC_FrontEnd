import React, { createContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SideBar from './SideBar';
import CourseInfoPage from './CourseInfoPage';
import MainDetail from './MainDetail';
import CouresContentPage from './CouresContentPage';
import RoadMapPage from './RoadMapPage';

export const CourseMainContext = createContext();

function CourseMainDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (courseId == null) {
            navigate(-1);
            return;
        }
    }, [])

    const detailData = [
        {
            name: "Course Info",
            link: "",
            component: <CourseInfoPage/>
        },
        {
            name: "Contents",
            link: "course-contents/*",
            component: <CouresContentPage/>
        },
        {
            name: "Roadmap",
            link: "roadmaps/*",
            component: <RoadMapPage/>
        },
    ]

    return (
        <CourseMainContext.Provider value={detailData}>
            <div className='flex py-[20px] justify-between'>
                <SideBar className={"w-[230px] h-100px"}/>
                <MainDetail className={"flex-1"}/>
            </div>
        </CourseMainContext.Provider>
    )
}

export default CourseMainDetail