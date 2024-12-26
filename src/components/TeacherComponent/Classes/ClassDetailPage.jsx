import React, { createContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import SideBar from './SideBar';
import MainDetail from './MainDetail';
import ClassInfoPage from '../../AdminComponent/Class/ClassMain/ClassMainDetail/ClassInfoPage';
import LessonPage from '../../AdminComponent/Class/ClassMain/ClassMainDetail/LessonPage';
import ClassMaterial from '../../AdminComponent/Class/ClassMain/ClassMainDetail/ClassMaterial';
import ScorePage from '../../AdminComponent/Class/ClassMain/ClassMainDetail/ScorePage';
import ProcessPage from '../../AdminComponent/Class/ClassMain/ClassMainDetail/ProcessPage';
import EnrollRequest from '../../AdminComponent/Class/ClassMain/ClassMainDetail/EnrollRequest';
import MembersClass from '../../AdminComponent/Class/ClassMain/ClassMainDetail/MembersClass';

export const ClassMainContext = createContext();

function ClassDetailPage() {
    const { classId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (classId == null) {
            navigate("/");
            return;
        }
    }, [])

    const detailData = [
        {
            name: "Members",
            link: "",
            component: <MembersClass isShowChat={true}/> 
        },
        {
            name: "Class Info",
            link: "class-info",
            component: <ClassInfoPage isTeacher={true}/>
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
            <div className='flex py-[20px] justify-between relative'>
                <SideBar className={"w-[230px] h-100px"} />
                <MainDetail className={"flex-1"}/>
            </div>
        </ClassMainContext.Provider>
    )
}

export default ClassDetailPage