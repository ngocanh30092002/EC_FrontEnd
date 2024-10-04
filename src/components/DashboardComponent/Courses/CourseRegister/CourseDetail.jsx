import toast from '@/helper/Toast';
import { createContext, memo, useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import CourseClasses from './CourseClasses';
import CourseEnrollments from './CourseEnrollments';

export const CourseDetailContext = createContext();


function CourseDetail({course}) {
    const [classes, setClasses] = useState([]);
    const [indexActive, setIndexActive] = useState(0);
    const sideBarMenu = [
        {
            title: "Classes",
            link:""
        },
        {
            title:"Enrollments",
            link:"enrollments"
        }
    ]
    const getCurrentClasses = useCallback(async () =>{
        try{
            if(course != null){
                var response = await appClient.get(`api/Classes/course/${course.courseId}`);
                var data = response.data;
                if(data.success){
                    setClasses(data.message);
                }
            }
        }
        catch(err){
            toast({
                type: "error",
                duration: 5000,
                title: "Error",
                message: err.message
            })
        }
    })

    useEffect(() =>{
        getCurrentClasses();
    }, [course])

    return (
        <div className='cd__wrapper grid grid-cols-12 h-full'>
            <div className='cd__sidebar-title col-span-12'>{course?.name}</div>
            <div className='col-span-12 min-h-0 lg:col-span-3 2xl:col-span-2 cd__sidebar--wrapper border-hidden lg:border-solid'>
                <ul className="cd__list--wrapper flex justify-center gap-4 mb-[20px] lg:block">
                    {sideBarMenu.map((item,index) => 
                        <SideBarItem 
                            key={index}
                            item={item} 
                            index = {index}
                            isActive={indexActive == index} 
                            onActive={setIndexActive} />
                    )}
                </ul>
            </div>

            <div className='col-span-12 lg:col-span-9 2xl:col-span-10'>
                <CourseDetailContext.Provider value = {{classes, setClasses}}>
                    <Routes>
                        <Route path='' element={<CourseClasses course ={course}/>}/>
                        <Route path='enrollments' element={<CourseEnrollments course = {course}/>}/>
                    </Routes>
                </CourseDetailContext.Provider>
            </div>
        </div>
    )
}


function SideBarItem({item, index, isActive, onActive}){
    const location = useLocation();

    useEffect(() =>{
        const pathName = location.pathname;
        console.log(pathName);
        if(pathName.includes(item.link)){
            onActive(index);
        }
    }, [location])

    const handleClickSideBar = () =>{
        onActive(index);
    }
    return (
        <li className={`cd__list-item ${isActive ? "active" : ""}`}>
            <Link onClick={handleClickSideBar} className='cd__item-link' to={item.link}>{item.title}</Link>
        </li>
    )
}

export default memo(CourseDetail)