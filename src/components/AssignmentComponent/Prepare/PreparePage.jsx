import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appClient } from '~/AppConfigs';

function PreparePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [processId, setProcessId] = useState(() => {
        const sessionId = params.get("id");
        return sessionStorage.getItem(sessionId);
    })

    const [processInfo, setProcessInfo] = useState(null);

    useEffect(() => {
        if (!processId) {
            navigate(-1);
        }

        const getProcessInfo = () => {
            if(processId != null){
                appClient.get(`api/learningprocesses/${processId}`)
                .then(res => res.data)
                .then(data => {
                    if(data.success){
                        setProcessInfo(data.message)
                    }
                })
                .catch(() => {
                    setProcessInfo(null);
                })
            }
        }

        getProcessInfo();
    }, [])

    useEffect(() => {
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

        const getAssignmentInfo = (id) =>{
            return appClient.get(`api/assignments/${id}`)
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

        if(processInfo){
            Promise.all([
                getEnrollInfo(processInfo.enrollId),
                getAssignmentInfo(processInfo.assignmentId)
            ])
            .then(([enrollment, assignment]) =>{
                navigate(`/assignment/in-process?mode=view-answer`, {
                    replace: true,
                    state: {
                        processId: processId,
                        user: enrollment.student,
                        class: enrollment.class.classId,
                        course: enrollment.class.courseId,
                        teacher: enrollment.teacherName,
                        enrollId: enrollment.enrollId,
                        time: "00:00:00",
                        assignment: assignment
                    }
                });
                localStorage.clear();
                sessionStorage.clear();
            })
        }
    }, [processInfo])


    return (
        <div></div>
    )
}

export default PreparePage