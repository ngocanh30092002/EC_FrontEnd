import React, { useEffect, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from './../../CommonComponent/DropDownList';
import { appClient } from '~/AppConfigs';

function ToeicNowItem({ onShowHistory, onChangeSelectedRoadMap }) {
    const [courseIds, setCourseIds] = useState([]);
    const [isToeic, setIsToeic] = useState(true);
    const handleShowHistory = () => {
        onShowHistory(true);
    }

    const handleSelectedItem = (item, index) => {
        if(item){
            if(item.key == "Toeic"){
                setIsToeic(true);
            } 
            else{
                setIsToeic(false);
            }
    
            onChangeSelectedRoadMap(item.key);
        }
        else{
            onChangeSelectedRoadMap("Toeic")
        }
    }

    useEffect(() => {
        const getCourseIds = async () => {
            try {
                const response = await appClient.get("api/roadmaps/course");
                const dataRes = response.data;
                if (dataRes.success) {
                    setCourseIds(["Toeic", ...dataRes.message]);
                }
            }
            catch {

            }
        }

        getCourseIds();
    }, [])
    return (
        <div className='grid grid-cols-12 w-full relative toeic-time__wrapper items-center h-[200px] overflow-visible'>
            <div className='tt__left-container col-span-3 flex items-center justify-center'>
            </div>
            <div className='flex justify-center h-full relative overflow-visible'>
                <div className='tt__timeline'>
                    <div className='tt__timeline-now'>
                        <img src={IMG_URL_BASE + "pin-location-white-icon.svg"} className='w-[30px]' />
                    </div>
                </div>
                <div className='tt__timeline-header'>
                </div>
            </div>
            <div className='tt__right-container col-span-8 h-full overflow-visible flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='tni__description'>
                        {isToeic ?
                            "We're here" :
                            "Your goal"
                        }
                    </div>
                    <div className='tni__description  cursor-pointer hover:opacity-90' onClick={handleShowHistory}>View history</div>
                </div>
            </div>

            <div className='overflow-visible absolute top-0 right-0 flex items-center '>
                <span className='flex-none p-[10px] tni__road-map'>Road Map</span>
                <DropDownList
                    data={courseIds.map((item) => ({ key: item, value: item }))}
                    defaultIndex={0}
                    className={"border !w-[140px]"}
                    onSelectedItem={handleSelectedItem}
                    hideDefault={true} />
            </div>
        </div>
    )
}

export default ToeicNowItem