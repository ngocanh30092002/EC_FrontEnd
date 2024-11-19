import React, { memo } from 'react'
import { APP_URL } from '~/GlobalConstant';
import { IMG_URL_BASE } from '~/GlobalConstant.js';

function CourseBackground({course}) {
    const defaultImage = IMG_URL_BASE + "beginer-demo.png"

    return (
        <div className='cb__wrapper'>
            <img src={course?.imageUrl ? APP_URL + course.imageUrl : defaultImage} className='cb__image-bg xl:max-h-[600px] lg:max-h-[500px]'/>

            <div className='cb__infor'>
            </div>
        </div>
    )
}

export default memo(CourseBackground);