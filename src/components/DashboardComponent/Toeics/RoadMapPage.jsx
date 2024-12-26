import React, { useEffect, useState } from 'react'
import ToeicTimeItem from './ToeicTimeItem'
import "./ToeicStyle.css"
import ToeicNowItem from './ToeicNowItem'
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';
import ToeicHistory from './ToeicHistory';
import RoadMapList from './RoadMapList';

function RoadMapPage() {
    const [toeicExams, setToeicExams] = useState([]);
    const [roadMaps, setRoadMaps] = useState([]);
    const [groupExams, setGroupExams] = useState([]);
    const [isShowHistory, setShowHistory] = useState(false);
    const [selectedRoadMap, setSelectedRoadMap] = useState("Toeic");

    useEffect(() => {
        const getToeicExams = () => {
            appClient.get("api/ToeicExams")
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setToeicExams(data.message);
                    }
                })
                .catch((ex) => {
                    toast({
                        type: "error",
                        title: "Error",
                        message: ex.message,
                        duration: 4000
                    });
                })
        }

        getToeicExams();
    }, [])

    useEffect(() => {
        const getRoadMaps = () =>{
            appClient.get("api/roadmaps")
            .then(res => res.data)
            .then(data =>{
                if(data.success){
                    setRoadMaps(data.message);
                }
            })
        }

        getRoadMaps();
    }, [])

    useEffect(() => {
        const groups = toeicExams.reduce((acc, item) => {
            if (!acc[item.year]) {
                acc[item.year] = [];
            }
            acc[item.year].push(item);
            return acc;
        }, {});

        setGroupExams(groups);
    }, [toeicExams])

    const handleSelectedRoadMap = (selectedRoadMap) => {
        setSelectedRoadMap(selectedRoadMap);
    }

    return (
        <div className='flex flex-col items-center justify-center  overflow-visible p-[20px] toeic-page__wrapper '>
            <ToeicNowItem onShowHistory={setShowHistory} onChangeSelectedRoadMap={handleSelectedRoadMap} />

            {
                selectedRoadMap == "Toeic" &&
                Object.keys(groupExams).reverse().map((year, index) => (
                    <ToeicTimeItem
                        key={year}
                        data={groupExams[year]}
                        year={year}
                        index={index}
                    />
                ))
            }

            <RoadMapList selectedRoadMap={selectedRoadMap} roadMaps={roadMaps} />
            {isShowHistory && <ToeicHistory onShowHistory={setShowHistory} selectedRoadMap = {selectedRoadMap} />}
        </div>
    )
}

export default RoadMapPage