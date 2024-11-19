import React, { useEffect, useState } from 'react'
import { appClient } from '~/AppConfigs';

function DictionaryPage() {
    const [classes, setClasses] = useState([]);

    useEffect(() =>{
        const getClasses = async () =>{
            try{
                var response = await appClient.get("api/classes");
                var data = response.data;
                if(data.success){
                    setClasses(data.message);
                }
            }
            catch(error){

            }
        }

        getClasses();
    }, [])

    const handleEnrollClass = (item)=>{
        
    }

    return (
        <div>
            {classes.map((item, index)=>
                <button className='p-[20px] border mr-5' onClick={(e) => handleEnrollClass(item)} key={index}>
                    {item.classId}
                </button>
            )}
        </div>
    )
}

export default DictionaryPage