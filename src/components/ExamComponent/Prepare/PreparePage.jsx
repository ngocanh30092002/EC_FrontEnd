import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appClient } from '~/AppConfigs';

function PreparePage() {
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

    useEffect(() => {
        const type = params.get("type");
        const examId = sessionStorage.getItem(params.get("examId"));
        const enrollId = sessionStorage.getItem(params.get("id"));
        const toeicId = sessionStorage.getItem(params.get("id"));
        const attemptId = params.get("attemptId");

        const handleWithProcessExam = async () => {
            try {
                if (enrollId == null || isNaN(atob(examId))) {
                    navigate("/");
                    return;
                }

                const responseEnrollInfo = await appClient.get(`api/enrolls/${enrollId}/student`);
                let dataEnroll = responseEnrollInfo.data.message;

                const responseExamination = await appClient.get(`api/Examinations/${atob(examId)}`);
                let dataExamination = responseExamination.data.message;

                const responseOngoing = await appClient.get(`api/LearningProcesses/ongoing/enrollments/${enrollId}?examId=${atob(examId)}`);
                let dataOngoing = responseOngoing.data.message;

                if (dataOngoing == null) {
                    const responseStatusExam = await appClient.get(`api/LearningProcesses/enrollments/${enrollId}/status-exam?examId=${atob(examId)}`)
                    let dataStatus = responseStatusExam.data.message;
                    if (dataStatus == null) {
                        const formData = new FormData();
                        formData.append("EnrollId", enrollId);
                        formData.append("ExamId", atob(examId));

                        const responseCreateProcess = await appClient.post("api/learningprocesses", formData);
                        const dataCreateProcess = responseCreateProcess.data;

                        if (dataCreateProcess.success) {
                            const { student, class: className } = dataEnroll;
                            navigate("overview", {
                                state: {
                                    processId: dataCreateProcess.message,
                                    userInfo: {
                                        ...student,
                                        image: dataEnroll.studentBackground.image
                                    },
                                    class: {
                                        classId: className.classId,
                                        courseId: className.courseId,
                                        teacherName: dataEnroll.teacherName
                                    },
                                    examination: {
                                        examId: dataExamination.examId,
                                        toeicId: dataExamination.toeicId,
                                        title: dataExamination.title,
                                        time: dataExamination.time,
                                        description: dataExamination.description
                                    }
                                }
                            })
                        }
                    }
                    else {
                        const responseQues = await appClient.get(`api/QuesToeic/toeic/${dataExamination.toeicId}`);
                        const dataQues = responseQues.data;

                        const { student, class: className } = dataEnroll;
                        const userInfo = {
                            processId: dataStatus.processId,

                            userInfo: {
                                ...student,
                                image: dataEnroll.studentBackground.image
                            },
                            class: {
                                classId: className.classId,
                                courseId: className.courseId,
                                teacherName: dataEnroll.teacherName
                            },
                            examination: {
                                examId: dataExamination.examId,
                                toeicId: dataExamination.toeicId,
                                title: dataExamination.title,
                                time: dataExamination.time,
                                description: dataExamination.description
                            }
                        }
                        navigate("/examination/in-process?mode=view-answer", {
                            replace: true,
                            state: {
                                userInfo: userInfo,
                                volumn: 1,
                                ques: dataQues.message
                            }
                        })
                    }
                }
                else {
                    const { student, class: className } = dataEnroll;
                    navigate("overview", {
                        state: {
                            processId: dataOngoing.processId,
                            userInfo: {
                                ...student,
                                image: dataEnroll.studentBackground.image
                            },
                            class: {
                                classId: className.classId,
                                courseId: className.courseId,
                                teacherName: dataEnroll.teacherName
                            },
                            examination: {
                                examId: dataExamination.examId,
                                toeicId: dataExamination.toeicId,
                                title: dataExamination.title,
                                time: dataExamination.time,
                                description: dataExamination.description
                            }
                        }
                    })
                }
            }
            catch (ex) {
                navigate("/");
            }
        }

        const handleWithToeicExam = async () => {
            try {
                if (toeicId == null) {
                    navigate("/");
                    return;
                }

                const responseUserInfo = await appClient.get("api/students/full-info");
                const userInfo = responseUserInfo.data.message;
                const responseToeicInfo = await appClient.get(`api/ToeicExams/${toeicId}`);
                const toeicInfo = responseToeicInfo.data.message;

                if (!attemptId) {
                    navigate("overview?mode=toeic-test", {
                        replace: true,
                        state: {
                            userInfo,
                            toeicInfo: {
                                ...toeicInfo,
                                time: convertMinutesToTime(toeicInfo.timeMinutes)
                            }
                        }
                    })
                }
                else {
                    const responseQues = await appClient.get(`api/QuesToeic/toeic/${toeicId}`);
                    const dataQues = responseQues.data;
                    
                    navigate("/examination/in-process?mode=view-answer", {
                        replace: true,
                        state: {
                            userInfo: {
                                userInfo: userInfo,
                                toeicInfo: {
                                    ...toeicInfo,
                                    time: convertMinutesToTime(toeicInfo.timeMinutes) 
                                }
                            },
                            attemptId: attemptId,
                            volumn: 1,
                            ques: dataQues.message,
                            isToeicMode: true
                        }
                    })
                }
            }
            catch (e) {
                navigate("/");
            }
        }

        if (!type) {
            navigate(-1);
            sessionStorage.clear();
        }
        else if (type == 1) {
            if (!examId || !enrollId) {
                navigate(-1);
                sessionStorage.clear();
            }

            handleWithProcessExam();
        }
        else if (type == 2) {
            if (!toeicId) {
                navigate(-1);
            }
            handleWithToeicExam();
        }
        else {
            navigate(-1);
        }
    }, [])


    return (
        <div></div>
    )
}

export default PreparePage