import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appClient } from '~/AppConfigs';

function PrepareHwPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [submissionInfo , setSubmissionInfo] = useState(null);
    const params = new URLSearchParams(location.search);

    const handleWithHomework = async (enrollId, homeworkId) => {
        try {
            const responseEnrollInfo = await appClient.get(`api/enrolls/${enrollId}/student`);
            let dataEnroll = responseEnrollInfo.data.message;

            const responseHomeworkInfo = await appClient.get(`api/homework/${homeworkId}`);
            let dataHomework = responseHomeworkInfo.data.message;

            const responseSubmission = await appClient.get(`api/HwSubmission/enrolls/${enrollId}/ongoing?homeworkId=${homeworkId}`);
            const dataSubmission = responseSubmission.data;
            if(dataSubmission.success && dataSubmission.message == null){
                const formData = new FormData();
                formData.append("EnrollId", enrollId);
                formData.append("HomeworkId", homeworkId);

                const responseCreateSubmission = await appClient.post("api/HwSubmission", formData);
                const dataCreate = responseCreateSubmission.data;

                if(dataCreate.success){
                    const { student, class: className } = dataEnroll;
                    
                    navigate(`/examination/overview?mode=homework`, {
                        state: {
                            submissionId: dataCreate.message,
                            userInfo: {
                                ...student,
                                image: dataEnroll.studentBackground.image
                            },
                            class: {
                                classId: className.classId,
                                courseId: className.courseId,
                                teacherName: dataEnroll.teacherName
                            },
                            homework: {...dataHomework}
                        }
                    });
                }
            }
            else{
                const { student, class: className } = dataEnroll;
                    
                    navigate(`/examination/overview?mode=homework`, {
                        state: {
                            submissionId: dataSubmission.message.submissionId,
                            userInfo: {
                                ...student,
                                image: dataEnroll.studentBackground.image
                            },
                            class: {
                                classId: className.classId,
                                courseId: className.courseId,
                                teacherName: dataEnroll.teacherName
                            },
                            homework: {...dataHomework}
                        }
                    });
            }
            
        }
        catch (e) {
            navigate("/");
        }
    }

    const handleWithHomeworkResult = async (submissionId) =>{
        try{
            if(submissionId == null){
                navigate(-1);
            }

            const response = await appClient.get(`api/HwSubmission/${submissionId}`);
            const submissionInfo  = response.data.message;


            const responseEnrollInfo = await appClient.get(`api/enrolls/${submissionInfo.enrollId}/student`);
            const enrollInfo = responseEnrollInfo.data.message;
            const responseHomeworkInfo = await appClient.get(`api/Homework/${submissionInfo.homeworkId}`);
            const homeworkInfo = responseHomeworkInfo.data.message;

            const { student, class: className } = enrollInfo;

            const userInfo = {
                submissionId: submissionId,
                userInfo:{
                    ...student,
                    image:enrollInfo.studentBackground.image,
                },
                class:{
                    classId: className.classId,
                    courseId: className.courseId,
                    teacherName: enrollInfo.teacherName
                },
                homework: {...homeworkInfo}
            }

            const responseQues = await appClient.get(`api/HwSubRecords/submission/${submissionId}/ques`);
            const dataQues = responseQues.data.message;


            let i = 0;
            dataQues.forEach(item => {
                item.subQues.forEach((subQues, index) => {
                    subQues.quesNo = i + 1;
                    i++;
                });
            });

            navigate("/examination/in-process?mode=view-answer", {
                replace: true,
                state: {
                    userInfo: userInfo,
                    volumn: 1,
                    ques: dataQues,
                    mode: 2
                }
            })
        }
        catch{

        }
    }

    useEffect(() => {
        const enrollId = sessionStorage.getItem(params.get("id"))
        const submissionId = sessionStorage.getItem(params.get("id"));
        const mode = params.get("mode");
        const homeworkId = params.get("homeworkId");

        if(!mode){
            if (!enrollId || !homeworkId) {
                navigate(-1);
                return;
            }

            handleWithHomework(enrollId, homeworkId);
        }
        else{
            handleWithHomeworkResult(submissionId);
        }


    }, [])

    return (
        <div></div>
    )
}

export default PrepareHwPage