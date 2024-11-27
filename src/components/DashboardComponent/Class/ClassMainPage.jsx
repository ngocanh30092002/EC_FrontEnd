import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import "./ClassStyle.css"

function ClassMainPage() {
    const [classes, setClasses] = useState([]);
    const [enrolls, setEnrolls] = useState([]);
    useEffect(() => {
        const getCurrentEnrolls = async () => {
            try {
                const response = await appClient.get("api/Enrolls/student/current-class");
                const data = response.data;
                if (data.success) {
                    setEnrolls(data.message);
                }
                else {
                    setEnrolls([]);
                }
            }
            catch {
                setEnrolls([]);
            }
        }

        getCurrentEnrolls();
    }, [])

    useEffect(() => {
        const getClassInfo = async (classId, enrollId) => {
            try {
                const response = await appClient.get(`api/Classes/${classId}`)
                const data = response.data;

                if (data.success) {
                    setClasses(preClasses => {
                        preClasses.push({
                            enrollId: enrollId,
                            ...data.message
                        })
                        return [...preClasses];
                    });
                }
            }
            catch {

            }
        }

        if (enrolls.length != 0) {
            enrolls.forEach(enroll => {
                let isExistClass = classes.some(c => c.enrollId == enroll.enrollId);
                if (!isExistClass) {
                    getClassInfo(enroll.classId, enroll.enrollId)
                }
            });
        }
    }, [enrolls])

    return (
        <div className='h-full'>
            {classes.length == 0 &&
                <div className='cmp__nothing-title flex w-full justify-center h-screen items-center'>
                    You have not registered for any course yet.
                </div>
            }

            {
                classes.length != 0 &&
                <div className='cmp__wrapper p-[20px] '>
                    {classes.map((item, index) => {
                        return (
                            <ClassItem data={item} key={index} />
                        )
                    })}
                </div>
            }
        </div>
    )
}

function ClassItem({ data }) {
    const navigate = useNavigate();

    const handleJoinClass = () =>{
        navigate(`/classes/${data.classId}`, {
            state: {
                enrollId: data.enrollId
            }
        });
    }
    return (
        <div className='cmp__class__wrapper w-full mb-[20px] bg-white flex p-[10px] rounded-[8px] border'>
            <div className='hidden md:block '>
                <img src={APP_URL + data.imageUrl} className='h-[300px] w-[450px] object-cover rounded-[8px]' />
            </div>

            <div className='cmp__class-info ml-[20px] flex flex-col flex-1'>
                <div className="cmp__class-name">{data.classId} - {data.courseId}</div>
                <div className="cmp__class-description ">{data.description}</div>

                <div className='cmp__class-more-info flex-1 mt-[5px]'>
                    <div className='flex items-center'>
                        <div className='cmp__class-info--title'>Registered:</div>
                        <div className='cmp__class-info--value'>{data.registeredNum}</div>
                    </div>
                    <div className='flex items-center'>
                        <div className='cmp__class-info--title'>Members:</div>
                        <div className='cmp__class-info--value'>{data.maxNum}</div>
                    </div>
                    <div className='flex items-center'>
                        <div className='cmp__class-info--title'>Start Date:</div>
                        <div className='cmp__class-info--value'>{data.startDate}</div>
                    </div>
                    <div className='flex items-center'>
                        <div className='cmp__class-info--title'>Status:</div>
                        <div className='cmp__class-info--value'>{data.status}</div>
                    </div>
                </div>

                <div className='cmp__class__teacher-info flex items-start md:items-center flex-col md:flex-row mt-[20px] md:mt-0'>
                    <div className='flex items-center flex-1'>
                        <div className=''>
                            <img src={APP_URL + data.teacher.imageUrl} className=' cmp__teacher-info--img w-[60px] h-[60px] object-cover rounded-[50%]' />
                        </div>
                        <div className='flex-1 flex flex-col ml-[20px]'>
                            <div className="cmp__teacher--name line-clamp-1">{data.teacher.fullName}</div>
                            <div className="cmp__teacher--email line-clamp-1">{data.teacher.email}</div>
                        </div>
                    </div>
                    <button className='cmp__btn-join mt-[10px] !w-full md:!w-[150px]' onClick={handleJoinClass}>Join Now</button>
                </div>
            </div>
        </div>
    )
}

export default ClassMainPage