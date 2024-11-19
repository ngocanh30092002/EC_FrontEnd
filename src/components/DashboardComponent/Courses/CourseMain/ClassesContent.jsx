import React, { useCallback, useState } from 'react'
import ClassItem from './ClassItem'
import { appClient } from '~/AppConfigs';

function ClassesContent() {
    const [classes, setClasses] = useState([])
    const getClasses = useCallback( async() => {
        try{
            const response = await appClient.get("api/enrolls/student/current-class")
            const data = response.data;

            if(data.success){
                setClasses(data.message);
            }
        }
        catch(error){

        }
    })

    useState(() => {
        getClasses();
    }, [])

    return (
        <div className={`class-content__wrapper mx-[20px] ${classes.length == 0 ? "hidden" : ""}`}>
            <div className='class-content__title'>Your Classes</div>

            <div className='class-content__list grid grid-cols-4 gap-[15px]'>
                {classes.map((item,index) =>
                    <ClassItem key={index} classId={item.classId}/>
                )}
            </div>
        </div>
    )
}

export default ClassesContent