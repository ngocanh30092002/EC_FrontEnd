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
    const [mode, setMode] = useState(0);
    const [enroll, setEnroll] = useState();
    const [assignment, setAssignment] = useState();
    const [homework, setHomework] = useState();
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
                                            assignment: assignment,
                                            mode: 0
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
                                    assignment: assignment,
                                    mode: 0
                                }
                            });
                            return;
                        }
                    })
            }
        }

        const handleCheckAndCreateSubmission = (enrollId, homeworkId) => {
            appClient.get(`api/HwSubmission/enrolls/${enrollId}/ongoing?homeworkId=${homeworkId}`)
                .then(res => res.data)
                .then(data => {
                    if (data.message == null) {
                        const formData = new FormData();
                        formData.append("EnrollId", enrollId);
                        formData.append("HomeworkId", homeworkId);

                        return appClient.post("api/HwSubmission", formData)
                            .then(res => res.data)
                            .then(data => {
                                navigate(`in-process`, {
                                    state: {
                                        hwSubmissionId: data.message,
                                        user: {
                                            ...enroll.student,
                                            image: enroll.studentBackground.image
                                        },
                                        class: enroll.class.classId,
                                        course: enroll.class.courseId,
                                        teacher: enroll.teacherName,
                                        enrollId: enroll.enrollId,
                                        time: homework.time,
                                        homework: homework,
                                        mode: 1
                                    }
                                });
                                sessionStorage.clear();
                            })
                    }
                    else {
                        navigate(`in-process`, {
                            state: {
                                hwSubmissionId: data.message.submissionId,
                                user: {
                                    ...enroll.student,
                                    image: enroll.studentBackground.image
                                },
                                class: enroll.class.classId,
                                course: enroll.class.courseId,
                                teacher: enroll.teacherName,
                                time: homework.time,
                                enrollId: enroll.enrollId,
                                homework: homework,
                                mode: 1
                            }
                        });
                        return;
                    }
                })
        }

        if (mode == 0) {
            handleCheckAndCreateProcess(enroll.enrollId, assignment.assignmentId);
        }
        else {
            handleCheckAndCreateSubmission(enroll.enrollId, homework.homeworkId);
        }
    }

    useEffect(() => {
        const newParams = getQueryParams();
        const enrollId = sessionStorage.getItem(newParams.id);

        if (newParams?.id == null) {
            navigate("/not-found");
            sessionStorage.clear();
        }
        if (sessionStorage.getItem(newParams.id) == null) {
            navigate("/not-found");
            sessionStorage.clear();
        }
        if (newParams?.mode) {
            if (newParams.mode > 1) {
                navigate("/not-found");
                sessionStorage.clear();
            }
            else {
                setMode(newParams.mode);
            }
        }

        setParams(newParams);

        setTimeout(() =>{
            sessionStorage.setItem(newParams.id, enrollId);
        }, 2100)
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

        const getHomeworkInfo = () => {
            if (params?.homeworkId) {
                appClient.get(`api/Homework/${params.homeworkId}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            setHomework(data.message);
                        }
                    })
                    .catch(() => {
                        setHomework(null);
                    })
            }
        }

        getEnrollInfo();

        if (mode == 0) {
            getAssignmentInfo();
        }
        else {
            getHomeworkInfo();
        }

    }, [params])

    useEffect(() => {
        if (enroll && assignment) {
            const getNumberAttempt = () => {
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

            if (mode == 0) {
                getNumberAttempt();
            }
        }
    }, [enroll, assignment])

    useEffect(() => {
        if (enroll && homework) {
            const getNumberAttempt = () => {
                appClient.get(`api/HwSubmission/enrolls/${enroll.enrollId}/number-attempt?homeworkId=${homework.homeworkId}`)
                    .then(res => res.data)
                    .then((data) => {
                        if (data.success) {
                            setNumberAttempted(data.message);
                        }
                    })
                    .catch(() => {
                        setNumberAttempted(1);
                    })
            }


            if (mode == 1) {
                getNumberAttempt();
            }
        }
    }, [enroll, homework])

    return (
        <div className='assignment-overview__wrapper h-full'>
            <OverViewHeader />
            <OverviewBody
                onAttempAssignment={handleAttempAssignment}
                assignment={assignment}
                enroll={enroll}
                numberAttempted={numberAttempted}
                homework={homework}
                mode={mode} />
            <AssignmentFooter />
        </div>
    )
}

export default OverViewAssignPage