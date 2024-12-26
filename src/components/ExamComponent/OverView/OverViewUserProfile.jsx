import React from 'react'
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';

function OverViewUserProfile({ className, examInfo }) {
    return (
        <div className={`${className} flex justify-center items-center `}>
            <div className="ovup__wrapper w-[95%] flex flex-col min-h-[450px]">
                <div className='flex justify-center p-[10px]'>
                    <img src={examInfo?.userInfo?.image ? APP_URL + examInfo.userInfo.image : IMG_URL_BASE + "unknown_user.jpg"} className='ovup__user-img object-cover' />
                </div>
                <div className='flex items-center flex-col'>
                    <div className='aob__full-name'>{examInfo?.userInfo?.firstName} {examInfo?.userInfo?.lastName}</div>
                    <div className='aob__user-name'>{examInfo?.userInfo?.userName}</div>
                </div>

                <div className='flex flex-col justify-center mt-[20px]'>

                    {
                        examInfo?.userInfo?.gender != null &&
                        <div className='flex items-center'>
                            <span className='aob__title-info'>Gender:</span>
                            <span className='aob__info'>{examInfo.userInfo.gender == 0 ? "Male" : examInfo.userInfo.gender == 1 ? "Female" : "Other"}</span>
                        </div>
                    }

                    {
                        examInfo?.userInfo?.dateOfBirth &&
                        <div className='flex items-center'>
                            <span className='aob__title-info'>Birthday:</span>
                            <span className='aob__info'>{examInfo.userInfo.dateOfBirth}</span>
                        </div>
                    }

                    {
                        examInfo?.userInfo?.email &&
                        <div className='flex items-center'>
                            <span className='aob__title-info'>Email:</span>
                            <span className='aob__info'>{examInfo.userInfo.email}</span>
                        </div>
                    }

                    {
                        examInfo?.class?.courseId &&
                        <div className='flex items-center'>
                            <span className='aob__title-info'>Course:</span>
                            <span className='aob__info'>{examInfo?.class?.courseId}</span>
                        </div>
                    }
                    {
                        examInfo?.class?.classId &&
                        <div className='flex items-center'>
                            <span className='aob__title-info'>Class:</span>
                            <span className='aob__info'>{examInfo.class.classId}</span>
                        </div>
                    }
                    {
                        examInfo?.class?.teacherName &&
                        <div className='flex items-center'>
                            <span className='aob__title-info'>Teacher:</span>
                            <span className='aob__info'>{examInfo.class.teacherName}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default OverViewUserProfile