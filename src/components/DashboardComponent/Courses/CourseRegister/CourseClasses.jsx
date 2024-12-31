import toast from '@/helper/Toast';
import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { appClient } from '~/AppConfigs';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import { CourseDetailContext } from './CourseDetail';

function CourseClasses({ course }) {
    const { classes, setClasses } = useContext(CourseDetailContext);
    const [enroll, setEnroll] = useState(null);

    const getEnroll = useCallback(async () => {
        try {
            var response = await appClient.get(`api/enrolls/courses/${course.courseId}`)
            var data = response.data;
            if (data.success) {
                setEnroll(data.message);
            }
        }
        catch {

        }
    })

    useEffect(() => {
        getEnroll();
    }, [classes, course])
    return (
        <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-[10px] ml-[15px]'>
            {classes.map((item, index) =>
                <CourseClassItem
                    key={index}
                    itemInfo={item}
                    enrollInfo={enroll}
                />
            )}
        </div>
    )
}


function CourseClassItem({ itemInfo, enrollInfo }) {
    const [isRegistering, setIsRegistering] = useState(() => {
        return itemInfo.classId == enrollInfo?.class?.classId;
    });

    useEffect(() => {
        setIsRegistering(itemInfo.classId == enrollInfo?.class?.classId);
    }, [enrollInfo])
    const defaultImage = IMG_URL_BASE + "unknown_user.jpg";
    const { teacher } = itemInfo;

    const changeFormatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'short', day: '2-digit' };
        return date.toLocaleDateString('en-US', options).replace(",", "");
    }

    const handleRegisterClass = () => {
        const formData = new FormData();
        formData.append("ClassId", itemInfo.classId);

        const handleSendData = async () => {
            try {
                const response = await appClient.post("api/enrolls", formData);
                const data = response.data;

                if (data.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        duration: 5000,
                        message: "Register successfully"
                    })

                    setIsRegistering(true);
                }
            }
            catch {

            }
        }

        handleSendData();
    }

    return (
        <div className="cci__wrapper flex flex-col mb-[15px]">
            <div className='cci__teacher-info flex items-center p-[15px]'>
                <img src={teacher?.imageUrl ? APP_URL + teacher.imageUrl : defaultImage} alt="" className="cci__teacher-img" />

                <div className='flex-1 ml-[15px]'>
                    <span className='cci__teacher-name'>{teacher?.fullName}</span>
                    <div>
                        <span className="cci__class-name  mr-[5px]">{itemInfo?.classId}</span>
                        -
                        <span className='cci__class-name ml-[5px]'>{itemInfo?.courseId}</span>
                    </div>
                </div>

                <img src={IMG_URL_BASE + "dot-icon.svg"} className='w-[20px] cursor-pointer' />
            </div>

            <div>
                <img src={itemInfo?.imageUrl ? APP_URL + itemInfo.imageUrl : defaultImage} alt="" className="cci__class-img" />
            </div>

            <div className='cci__class-info flex flex-col flex-1'>
                <div className="cci__class-des line-clamp-3 flex-1">{itemInfo?.description}</div>

                <div className='flex'>
                    <div className='cci__class-info-item flex-1'>
                        <img src={IMG_URL_BASE + "clock-icon1.svg"} alt="" className="cci__ci--img" />
                        <span className="cci__ci--text mr-[5px]">{changeFormatDate(itemInfo?.startDate)}</span>
                        <span>~</span>
                        <span className="cci__ci--text ml-[5px]">{changeFormatDate(itemInfo?.endDate)}</span>
                    </div>
                </div>

                <div className='cci__class-info-item'>
                    <img src={IMG_URL_BASE + "members.svg"} alt="" className="cci__ci--img" />
                    <span className="cci__ci--text">{itemInfo?.registeredNum} / {itemInfo?.maxNum}</span>
                </div>

                <div className='cci__class-info-item'>
                    <img src={IMG_URL_BASE + "wave.svg"} alt="" className="cci__ci--img" />
                    <span className="cci__ci--text ">{itemInfo?.status}</span>
                </div>
            </div>

            {isRegistering ?
                <button className='cci__btn registering'>
                    Registering
                </button>
                :
                <button className='cci__btn' onClick={handleRegisterClass}>
                    <div className='cci__btn-bg'></div>
                    Register
                </button>
            }
        </div>
    )
}
export default memo(CourseClasses)