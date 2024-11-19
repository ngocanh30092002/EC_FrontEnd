import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import HistoryProcesses from '../../DashboardComponent/Courses/CourseDetail/HistoryProcesses';

function OverviewBody({onAttempAssignment, assignment, enroll, numberAttempted}) {
    const navigate = useNavigate();
    const [isShowHis, setIsShow] = useState(false);

    const handleAttempAssignment = (e) =>{
        onAttempAssignment();
    }
    const handleSetShow = (data) =>{
        setIsShow(data);
    }
    const handleViewResult = () =>{
        setIsShow(true);
    }

    return (
        <div className='h-full relative'>
            <img src={IMG_URL_BASE + "overview_bg.jpg"} className='w-screen h-screen object-cover opacity-80' />
            <div className='absolute z-10 top-0 w-screen h-screen flex flex-col'>
                <div className='aob__cc-title'>{assignment?.courseContentTitle}</div>

                <div className='grid grid-cols-12 gap-[20px] px-[40px] py-[10px] mt-[20px] min-h-[420px] h-full'>
                    <div className='col-span-9 aob__assignment-info--wrapper flex items-center justify-center '>
                        <div className='w-[600px] translate-y-[-15%] h-[95%] aob__assginment-container bg-white max-h-[380px]'>
                            <div className='aob__assignment-title text-center'>{assignment?.title}</div>
                            <div className='px-[20px]' >
                                <div className='flex items-center '>
                                    <span className='aob__assignment-header flex-1 border-t-0'>Time </span>
                                    <span className='aob__assignment-value flex-1 border-t-0'> {assignment?.time}</span>
                                </div>
                                <div className='flex items-center'>
                                    <span className='aob__assignment-header flex-1'>Pass Rate</span>
                                    <span className='aob__assignment-value flex-1'>{assignment?.achieved_Percentage}%</span>
                                </div>
                                <div className='flex items-center'>
                                    <span className='aob__assignment-header flex-1'>Number Attempted</span>
                                    <span className='aob__assignment-value flex-1'>{numberAttempted}</span>
                                </div>
                            </div>

                            <div className='flex items-center justify-between px-[20px]'>
                                <button className='aob-btn' onClick={handleAttempAssignment}>Attempt Now</button>
                                <button className='aob-btn hover:bg-red-700' onClick={handleViewResult}>View Result</button>
                            </div>
                        </div>
                    </div>

                    <div className='col-span-3 flex justify-center items-center'>
                        <div className="aob__user-info--wrapper translate-y-[-15%] w-[95%] h-[95%] max-h-[380px] flex flex-col">
                            <div className='flex justify-center p-[10px]'>
                                <img src={enroll?.studentBackground?.image ? APP_URL + enroll.studentBackground.image : IMG_URL_BASE + "unknown_user.jpg" } className='aob__user-img' />
                            </div>
                            <div className='flex items-center flex-col'>
                                <div className='aob__full-name'>{enroll?.student?.firstName} {enroll?.student?.lastName}</div>
                                <div className='aob__user-name'>{enroll?.student?.userName}</div>
                            </div>

                            <div className='flex flex-col justify-center mt-[10px]'>
                                <div className='flex items-center'>
                                    <span className='aob__title-info'>Course:</span>
                                    <span className='aob__info'>{enroll?.class?.courseId}</span>
                                </div>
                                <div className='flex items-center'>
                                    <span className='aob__title-info'>Class:</span>
                                    <span className='aob__info'>{enroll?.class?.classId}</span>
                                </div>
                                <div className='flex items-center'>
                                    <span className='aob__title-info'>Teacher:</span>
                                    <span className='aob__info'>{enroll?.teacherName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isShowHis && <HistoryProcesses onSetShow={handleSetShow} type={1} assignmentId={assignment.assignmentId} enrollId={enroll.enrollId}/>}
        </div>
    )
}

export default OverviewBody