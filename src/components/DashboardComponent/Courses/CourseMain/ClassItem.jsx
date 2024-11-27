import React from 'react'
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ClassItem({data}) {
    const [classInfo, setClassInfo] = useState({});
    const defaultImageClass = IMG_URL_BASE + "unknown_user.jpg";
    const colors = ["bg-neutral-400","bg-green-500","bg-red-600"]
    const changeFormatTime = useCallback((time) =>{
        const date = new Date(time);
        const options = { month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options).replace(' ', '-');
        return formattedDate;
    })

    const getClassInfo = useCallback(async () =>{
        try{
            var response = await appClient.get("api/classes/"+ data.classId);

            const dataRes = response.data;
        
            if(dataRes.success){
                setClassInfo(dataRes.message);
            }
        }
        catch{

        }
    })

    useEffect(() =>{
        getClassInfo();
    }, [])

    return (
        <Link className='ci__wrapper' to={`/classes/${data.classId}`} state={{
            enrollId: data.enrollId
        }}>
            <div className='ci__content relative'>
                <div className="ci__img">
                    <img src={classInfo?.imageUrl ? APP_URL + classInfo.imageUrl : defaultImageClass}/>
                </div>

                <div className='ci__info'>
                    <span className='ci__class-name'>
                        {classInfo.courseId}
                        <span className="ci__class-code">({classInfo.classId})</span>
                    </span>
                    <span className="ci__teacher-by">
                        By: 
                        <span className='ci__teacher--name'>{classInfo.teacherName}</span>
                    </span>
                </div>
                <div className={`ci__status ${colors[classInfo.status]}`}></div>
            </div>

            <div className="ci__sub-content">
                <span className='ci__registered-number'>{classInfo.registeredNum}/{classInfo.maxNum} Registered</span>
                <div className='flex items-center'>
                    <span className='ci__start-date'>{changeFormatTime(classInfo.startDate)}</span>
                    <span className='text-center mx-[5px] ci__seperate'>~</span>
                    <span className='ci__end-date'>{changeFormatTime(classInfo.endDate)}</span>
                </div>
            </div>
        </Link>
    )
}

export default ClassItem