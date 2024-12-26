import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appClient } from '~/AppConfigs';

function PrepareRoadMapPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    function convertMinutesToTime(minutes) {
        let hours = Math.floor(minutes / 60);
        let remainingMinutes = minutes % 60;
        let seconds = 0;

        hours = hours < 10 ? '0' + hours : hours;
        remainingMinutes = remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return `${hours}:${remainingMinutes}:${seconds}`;
    }

    const handleWithRoadMapExam = async (id, attemptId) => {
        try {
            const responseUserInfo = await appClient.get("api/users/full-info");
            const userInfo = responseUserInfo.data.message;
            const responseRoadMapExam = await appClient.get(`api/RoadMapExams/${id}`);
            const roadMapInfo = responseRoadMapExam.data.message;

            if (!attemptId) {
                navigate("/examination/overview?mode=road-map-test", {
                    replace: true,
                    state: {
                        userInfo,
                        roadMapInfo: {
                            ...roadMapInfo,
                            time: convertMinutesToTime(roadMapInfo.time_Minutes)
                        },
                    }
                })
            }
            else {
                const responseQues = await appClient.get(`api/ToeicPractice/attempt/${attemptId}`);
                const dataQues = responseQues.data;
                const quesInfors = dataQues.message;

                let i = 0;
                quesInfors.forEach(item => {
                    item.subQues.forEach((subQues, index) => {
                        subQues.quesNo = i + 1;
                        i++;
                    });
                });

                navigate("/examination/in-process?mode=view-answer", {
                    replace: true,
                    state: {
                        userInfo: {
                            userInfo: userInfo,
                            roadMapInfo: {
                                ...roadMapInfo,
                                time: convertMinutesToTime(roadMapInfo.time_Minutes)
                            }
                        },
                        attemptId: attemptId,
                        volumn: 1,
                        ques: quesInfors,
                        mode: 3
                    }
                })
            }

        }
        catch (err){
            navigate(-1);
        }
    }

    useEffect(() => {
        const roadMapExamId = sessionStorage.getItem(params.get("id"))
        const attemptId = params.get("attemptId");
        if (!roadMapExamId) {
            navigate(-1);
            return;
        }

        handleWithRoadMapExam(roadMapExamId, attemptId);
    }, [])
    return (
        <div></div>
    )
}

export default PrepareRoadMapPage