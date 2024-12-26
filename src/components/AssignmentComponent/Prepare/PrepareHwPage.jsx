import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';

function PrepareHwPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [hwSubmissionId, setHwSubmissionId] = useState(() => {
        const sessionId = params.get("id");
        return sessionStorage.getItem(sessionId);
    })

    const [submissionInfo, setSubmissionInfo] = useState(null);

    useEffect(() => {
        if (!hwSubmissionId) {
            navigate(-1);
        }

        const getSubmissionInfo = () => {
            if(hwSubmissionId != null){
                appClient.get(`api/HwSubmission/${hwSubmissionId}`)
                .then(res => res.data)
                .then(data => {
                    if(data.success){
                        setSubmissionInfo(data.message)
                    }
                })
                .catch(() => {
                    setSubmissionInfo(null);
                })
            }
        }

        getSubmissionInfo();
    }, [])

    useEffect(() =>{
        const getEnrollInfo = (id) => {
            return appClient.get(`api/enrolls/${id}/student`)
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    return data.message;
                })
                .catch(() => {
                    return null;
                })
        }

        const getHomeworkInfo = (id) =>{
            return appClient.get(`api/Homework/${id}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        return data.message;
                    })
                    .catch(() => {
                        return null;
                    })
        }

        if(submissionInfo){
            Promise.all([
                getEnrollInfo(submissionInfo.enrollId),
                getHomeworkInfo(submissionInfo.homeworkId)
            ])
            .then(([enrollment, homework]) =>{
                navigate(`/assignment/in-process?mode=view-answer`, {
                    replace: true,
                    state: {
                        hwSubmissionId: hwSubmissionId,
                        user: enrollment.student,
                        class: enrollment.class.classId,
                        course: enrollment.class.courseId,
                        teacher: enrollment.teacherName,
                        enrollId: enrollment.enrollId,
                        time: "00:00:00",
                        homework: homework,
                        mode: 1
                    }
                });

                localStorage.clear();
                sessionStorage.clear();
            })
        }
    }, [submissionInfo])

    return (
        <div></div>
    )
}

export default PrepareHwPage