import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AssignmentFooter from '../AssignmentFooter';
import OverviewBody from './OverviewBody';
import "./OverviewStyle.css";
import OverViewHeader from './AssignmentHeader';
import { appClient } from '~/AppConfigs';

function OverViewAssignPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params, setParams] = useState();
    const [enroll, setEnroll] = useState();
    const [assignment, setAssignment] = useState();
    const [numberAttempted, setNumberAttempted] = useState();

    const getQueryParams = () => {
        const query = new URLSearchParams(location.search);
        const params = {};
        query.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    };

    const handleAttempAssignment = () => {
        const handleCheckAndCreateProcess = (enrollId, assignmentId) => {
            if (enrollId) {
                appClient.get(`api/learningprocesses/ongoing/enrollments/${enrollId}?assignmentId=${assignmentId}`)
                    .then(res => res.data)
                    .then(data => {
                        if (data.message == null) {
                            const formData = new FormData();
                            formData.append("EnrollId", enrollId);
                            formData.append("AssignmentId", assignmentId);

                            return appClient.post("api/learningprocesses", formData)
                                .then(res => res.data)
                                .then(data => {
                                    navigate(`in-process`, {
                                        state: {
                                            processId: data.message,
                                            user: {
                                                ...enroll.student,
                                                image: enroll.studentBackground.image
                                            },
                                            class: enroll.class.classId,
                                            course: enroll.class.courseId,
                                            teacher: enroll.teacherName,
                                            enrollId: enroll.enrollId,
                                            time: assignment.time,
                                            assignment: assignment
                                        }
                                    });
                                    sessionStorage.clear();
                                })
                        }
                        else {
                            navigate(`in-process`, {
                                state: {
                                    processId: data.message.processId,
                                    user: {
                                        ...enroll.student,
                                        image: enroll.studentBackground.image
                                    },
                                    class: enroll.class.classId,
                                    course: enroll.class.courseId,
                                    teacher: enroll.teacherName,
                                    time: assignment.time,
                                    enrollId: enroll.enrollId,
                                    assignment: assignment
                                }
                            });
                            return;
                        }
                    })
            }
        }

        handleCheckAndCreateProcess(enroll.enrollId, assignment.assignmentId);
    }

    useEffect(() => {
        const newParams = getQueryParams();
        if (newParams?.id == null) {
            navigate("/not-found");
            sessionStorage.clear();
        }
        if (sessionStorage.getItem(newParams.id) == null) {
            navigate("/not-found");
            sessionStorage.clear();
        }
        setParams(newParams);
    }, [location.search])

    useEffect(() => {
        const getEnrollInfo = () => {
            if (params?.id) {
                const enrollId = sessionStorage.getItem(params.id);

                appClient.get(`api/enrolls/${enrollId}/student`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            setEnroll(data.message);
                        }
                    })
                    .catch(() => {
                        setEnroll(null);
                    })
            }
        };

        const getAssignmentInfo = () => {
            if (params?.assignmentId) {
                appClient.get(`api/assignments/${params.assignmentId}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            setAssignment(data.message);
                        }
                    })
                    .catch(() => {
                        setAssignment(null);
                    })
            }
        }

        getEnrollInfo();
        getAssignmentInfo();
    }, [params])

    useEffect(() => {
        if (enroll && assignment) {
            const getNumberAttemp = () => {
                appClient.get(`api/learningprocesses/enrollments/${enroll.enrollId}/number-attempted?assignmentId=${assignment.assignmentId}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            setNumberAttempted(data.message);
                        }
                    })
                    .catch(() => {
                        setNumberAttempted(1);
                    })
            }

            getNumberAttemp();
        }
    }, [enroll, assignment])


    return (
        <div className='assignment-overview__wrapper h-full'>
            <OverViewHeader />
            <OverviewBody onAttempAssignment={handleAttempAssignment} assignment={assignment} enroll={enroll} numberAttempted={numberAttempted} />
            <AssignmentFooter />
        </div>
    )
}

export default OverViewAssignPage