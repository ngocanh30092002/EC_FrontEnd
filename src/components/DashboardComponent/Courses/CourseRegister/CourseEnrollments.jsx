import React, { memo, useCallback, useContext, useEffect, useState } from 'react'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { CourseDetailContext } from './CourseDetail';
import  toast  from '@/helper/Toast';

function CourseEnrollments({course}) {
    const [enrolls, setEnrolls] = useState([]);

    const getEnrolls = useCallback(async () =>{
        try{
            if(course!=null){
                var response = await appClient.get(`api/enrolls/his/courses/${course.courseId}`);
                var data = response.data;
                if(data.success){
                    setEnrolls([...data.message]);
                }
            }
        }
        catch{

        }
    })

    const handleRemoveEnroll = (id) =>{
        setEnrolls(enrolls.filter(e => e.enrollId != id))
    }
    const handleUpdateEnroll = () =>{
        getEnrolls();
    }

    useEffect(() =>{
        getEnrolls();
    }, [course])

    return (
        <div>
            {enrolls.length == 0 ?
                <div className='ce__no-enrollments'>
                    There are no enrollments
                </div>
                :
                <div className='ce__wrapper relative'>
                    <div className='w-full sticky top-0 z-10 flex ce__header-col'>
                        <div className='w-0 lg:w-1/12'>No</div>
                        <div className='w-1/2 lg:w-1/3'>Class</div>
                        <div className='w-0 lg:w-1/6'>Date</div>
                        <div className='w-1/4 lg:w-1/4'>Update Time</div>
                        <div className='w-1/4 lg:w-1/6'>Status</div>
                    </div>

                    <div className='ce__body overflow-visible'>
                        {enrolls.map((item, index) => 
                            <CourseEnrollItem 
                                key={index} 
                                itemInfo ={item} 
                                index ={index} 
                                onRemoveEnroll = {handleRemoveEnroll} 
                                onUpdate = {handleUpdateEnroll}/> 
                        )}
                    </div>
                </div>
            }
        </div>
    )
}



function CourseEnrollItem({itemInfo, index, onRemoveEnroll, onUpdate}) {
    const {classes} = useContext(CourseDetailContext);
    const [otherClasses, setOtherClasses] = useState(() =>{
        return classes.filter(classItem => classItem.classId != itemInfo?.class?.classId);
    })
    const [classInfo , setClassInfo] = useState(itemInfo?.class)
    const [isEditing, setIsEditing] = useState(false);
    const [isShowClasses, setIsShowClasses] = useState(false);
    const defaultImage = IMG_URL_BASE + "unknown_user.jpg"
    const statusColors = {
        Pending: "bg-slate-400",
        Accepted: "bg-yellow-400",
        Waiting: "bg-blue-400",
        Ongoing: "bg-orange-400",
        Completed: "bg-green-400",
        Rejected: "bg-red-400",
    }

    useEffect(()=>{
        setOtherClasses(() =>{
            return classes.filter(classItem => classItem.classId != classInfo?.classId);
        })
    }, [classInfo])

    const changeFormatEnrollDate = (enrollDate) =>{
        return enrollDate.split("-").reverse().join("/");
    }

    const changeFormatUpdateTime = (updateTime) =>{
        const [timeStamp , dateTime] = updateTime.split("T").reverse();
        return timeStamp.substring(0, timeStamp.indexOf('.')) + " " + changeFormatEnrollDate(dateTime);
    }

    const handleEditClick = () =>{
        setIsEditing(true);
    }

    const handleRemoveClick = () =>{
        var answer = confirm("Are you sure you want to delete?");
        
        if(!answer){
            setIsEditing(false);
            setIsShowClasses(false);
            return;
        }

        const executeRemoveEnroll = async() =>{
            try{
                var response = await appClient.put(`api/enrolls/${itemInfo.enrollId}/reject`);
                var data = response.data;
                if(data.success){
                    onRemoveEnroll(itemInfo.enrollId);
                    toast({
                        type: "success",
                        duration: 5000,
                        title: "Success",
                        message: "Remove successfully"
                    })
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

            setIsEditing(false);
            setIsShowClasses(false);
        }

        executeRemoveEnroll();
    }

    const handleSaveClick = () =>{
        if(itemInfo.class.classId != classInfo.classId){
            var answer = confirm("Are you sure you want to change?");

            const executeUpdateEnroll = async() =>{
                try{
                    const response = await appClient.put(`api/enrolls/${itemInfo.enrollId}/class/${classInfo.classId}/change-class`);
                    const data = response.data;
                    if(data.success){
                        toast({
                            type: "success",
                            title: "Success",
                            duration: 5000,
                            message: "Updated successfully"
                        })

                        onUpdate();
                    }
                }
                catch(err){
                    toast({
                        type: "error",
                        duration: 5000,
                        title: "Error",
                        message: err.message
                    })

                    setClassInfo(itemInfo?.class);
                    setIsShowClasses(false);
                }
            }

            if(answer){
                executeUpdateEnroll();
            }
            else{
                setClassInfo(itemInfo?.class);
            }
        }

        setIsEditing(false);
        setIsShowClasses(false);
    }

    const handleClassClick = (e, item) =>{
        setClassInfo(item);
        setIsShowClasses(false);
    }

    const handleShowListClass = () =>{
        if(!isEditing) return;

        setIsShowClasses(!isShowClasses);
    }

    return (
       <div className='ceb_row overflow-visible'>
            <div className='w-0 lg:w-1/12'>#{index + 1}</div>
            <div className='w-1/2 lg:w-1/3 relative overflow-visible'>
                <div className='flex cursor-pointer' onClick={handleShowListClass}>
                    <img src={classInfo?.imageUrl ? APP_URL + classInfo.imageUrl : defaultImage} className='w-[50px] h-[50px] object-cover rounded-[8px]'/>

                    <div className='ml-[10px] flex flex-col justify-center'>
                        <span className='ceb__teacher-name text-[12px] md:text-[14px]'>{classInfo?.teacher?.fullName}</span>
                        <div className='ceb__class-info'>
                            <span className='mr-[5px] !text-[12px] md:!text-[14px] '>{classInfo?.classId}</span>
                            <span className='!text-[12px] md:!text-[14px]'>-</span>
                            <span className='ml-[5px] !text-[12px] md:!text-[14px]'>{classInfo?.courseId}</span>
                        </div>
                    </div>
                </div>

                <ul className={`ceb__list-class ${isShowClasses && "show"}`}>
                    {otherClasses.map((item,index) =>{
                        return <li className='ceb__class-item' key={index} onClick={(e) => handleClassClick(e, item)}>
                            <div className='flex'>
                                <img src={item?.imageUrl ? APP_URL + item.imageUrl : defaultImage} className='w-[50px] h-[50px] object-cover rounded-[8px]'/>

                                <div className='ml-[10px] flex flex-col justify-center'>
                                    <span className='ceb__teacher-name text-[12px] md:text-[14px]'>{item?.teacher?.fullName}</span>
                                    <div className='ceb__class-info'>
                                        <span className='mr-[5px] !text-[12px] md:!text-[14px] '>{item?.classId}</span>
                                        <span className='!text-[12px] md:!text-[14px]'>-</span>
                                        <span className='ml-[5px] !text-[12px] md:!text-[14px]'>{item?.courseId}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    })}
                </ul>
            </div>
            <div className='w-0 lg:w-1/6'>{changeFormatEnrollDate(itemInfo?.enrollDate)}</div>
            <div className='w-1/4 lg:w-1/4 !text-[12px] md:!text-[14px]'>{changeFormatUpdateTime(itemInfo?.updateTime)}</div>
            <div className='w-1/4 lg:w-1/6 flex items-center justify-between relative'>
                <div className='ceb__status'>
                    <div className={`ceb__status-circle ${statusColors[itemInfo?.enrollStatus]}`}></div>
                    <span className='!text-[12px] md:!text-[14px]'>{itemInfo?.enrollStatus}</span>
                </div>

                <div className={itemInfo?.enrollStatus == "Ongoing" || itemInfo?.enrollStatus == "Completed" || itemInfo?.enrollStatus == "Rejected" ? "hidden" : "" }>
                    {isEditing ?
                        <div className='ceb__option flex flex-col flex-1 items-end'>
                            <div onClick={handleSaveClick}><img src={IMG_URL_BASE + "check-icon-blue.svg"} alt="" className='w-[15px]' /></div>
                            <div onClick={handleRemoveClick}><img src={IMG_URL_BASE + "close.svg"} alt="" className='w-[15px]' /></div>
                        </div>
                        :
                        <div className='ceb__option' onClick={handleEditClick}>
                            <div> <img src={IMG_URL_BASE + "edit-icon.svg"} alt="" className='w-[15px]'/> </div>
                        </div>
                    }
                </div>
            </div>
       </div>
    )
}
export default memo(CourseEnrollments)