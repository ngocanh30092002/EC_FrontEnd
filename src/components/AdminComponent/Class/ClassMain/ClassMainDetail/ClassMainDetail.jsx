import React, { createContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SideBar from './SideBar';
import MainDetail from './MainDetail';
import MembersClass from './MembersClass';
import EnrollRequest from './EnrollRequest';
import ScorePage from './ScorePage';
import LessonPage from './LessonPage';
import SchedulePage from './SchedulePage';
import ClassMaterial from './ClassMaterial';
import ClassInfoPage from './ClassInfoPage';
import ProcessPage from './ProcessPage';

export const ClassMainContext = createContext();

function ClassMainDetail() {
    const { classId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (classId == null) {
            navigate(-1);
        }
    }, [])

    const detailData = [
        {
            name: "Members",
            link: "",
            component: <MembersClass/>
        },
        {
            name: "Class Info",
            link: "class-info",
            component: <ClassInfoPage/>
        },
        {
            name: "Schedule",
            link: "schedule",
            component: <SchedulePage/>
        },
        {
            name: "Lessons",
            link: "lessons/*",
            component: <LessonPage/>
        },
        {
            name: "Materials",
            link: "materials",
            component: <ClassMaterial/>
        },
        {
            name: "Scores",
            link: "scores",
            component: <ScorePage/>
        },
        {
            name: "Learning Process",
            link: "process",
            component: <ProcessPage/>
        },
        ,
        {
            name: "Request Enrolls",
            link: "enrollments",
            component: <EnrollRequest/>
        },
    ]

    return (
        <ClassMainContext.Provider value={detailData}>
            <div className='flex py-[20px] justify-between'>
                <SideBar className={"w-[230px] h-100px"} />
                <MainDetail className={"flex-1"}/>
            </div>
        </ClassMainContext.Provider>
    )
}

export default ClassMainDetail