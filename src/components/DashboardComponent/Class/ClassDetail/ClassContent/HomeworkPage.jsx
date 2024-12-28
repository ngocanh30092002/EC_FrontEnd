import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';
import { CreateRandom } from '@/helper/RandomHelper';
import DropDownList from './../../../../CommonComponent/DropDownList';


function HomeworkPage({ enrollId }) {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [homework, setHomework] = useState([]);
    const [renderHomework, setRenderHomework] = useState([]);
    const [submissonTasks, setSubmissionTasks] = useState([]);
    const [defaultIndex, setDefaultIndex] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [lessonData, setLessonData] = useState([]);
    const [defaultLessonIndex, setDefaultLessonIndex] = useState(0);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const filterData = [
        {
            key: "All",
            value: 1
        },
        {
            key: "Waiting",
            value: 2
        },
        {
            key: "Open",
            value: 3
        },
        {
            key: "Late",
            value: 4
        },
        {
            key: "Overdue",
            value: 5
        },
    ]

    const handleSelectedFilter = (item, index) => {
        setSelectedFilter(item);
        setDefaultIndex(index);
    }

    const handleSelectedLesson = (item, index) => {
        setSelectedLesson(item?.value);
        setDefaultLessonIndex(index);
    }

    useEffect(() => {
        if (!classId) {
            navigate(-1);
        }
    }, [])

    useEffect(() => {
        const getCurrentHomework = async () => {
            try {
                const response = await appClient.get(`api/homework/classes/${classId}`);
                const resData = response.data;
                if (resData.success) {
                    setHomework(resData.message);
                    setDefaultIndex(0);
                    setSelectedFilter(filterData[0]);
                    setRenderHomework(resData.message);
                }
            }
            catch {

            }
        }

        const getSubmissionTask = async () => {
            try {
                const response = await appClient.get(`api/submissiontasks/classes/${classId}`);
                const resData = response.data;
                if (resData.success) {
                    setSubmissionTasks(resData.message);
                }
            }
            catch {

            }
        }

        const getLessonData = async () => {
            try {
                const response = await appClient.get(`api/lessons/classes/${classId}/date`);
                const dataRes = response.data;
                if (dataRes) {
                    const lessonData = dataRes.message.map((item, index) => ({ key: item.date, value: item.lessonId }));
                    lessonData.unshift({ key: "All", value: 0 });
                    setLessonData(lessonData);
                }
            }
            catch {

            }
        }

        getCurrentHomework();
        getSubmissionTask();
        getLessonData();
    }, [])

    useEffect(() => {
        if (selectedFilter?.value == 1 && selectedLesson == 0) {
            setRenderHomework(homework);
        }
        else{
            if (selectedFilter?.value != null && selectedLesson != null) {
                let newListHomework = homework.filter(i => i.lessonId == selectedLesson);
    
                console.log(selectedFilter.value, selectedLesson);
    
                if (selectedFilter.value == 2) {
                    newListHomework = newListHomework.filter(i => i.status == 0 && i.lessonId == selectedLesson);
                }
    
                if (selectedFilter.value == 3) {
                    newListHomework = newListHomework.filter(i => i.status == 1 && i.lessonId == selectedLesson);
                }
    
                if (selectedFilter.value == 4) {
                    newListHomework = newListHomework.filter(i => i.status == 2 && i.lessonId == selectedLesson);
                }
    
                if (selectedFilter.value == 5) {
                    newListHomework = newListHomework.filter(i => i.status == 3 && i.lessonId == selectedLesson);
                }
    
                setRenderHomework(newListHomework);
            }
        }

    }, [selectedFilter, selectedLesson])

    return (
        <div>
            <div className='hp__current--wrapper p-[20px] overflow-visible'>
                <div className='flex justify-between items-center overflow-visible mb-[15px]'>
                    <div className='hp__current-title'>Current Available</div>
                    <div className="flex items-center overflow-visible">
                        <div className='flex items-center overflow-visible mr-[20px]'>
                            <div className='hp__filter--title mr-[10px]'>Lesson</div>
                            <DropDownList
                                data={lessonData}
                                className={"border !w-[150px] !py-[8px]"} tblClassName={"!w-[150px]"}
                                defaultIndex={defaultLessonIndex}
                                onSelectedItem={handleSelectedLesson}
                            />
                        </div>
                        <div className='flex items-center overflow-visible'>
                            <div className='hp__filter--title'>Filter</div>
                            <DropDownList
                                data={filterData}
                                className={"border !w-[120px] !py-[8px]"} tblClassName={"!w-[120px]"}
                                defaultIndex={defaultIndex}
                                onSelectedItem={handleSelectedFilter}
                            />
                        </div>
                    </div>
                </div>
                <div className='hp__homework--wrapper grid grid-cols-3 gap-[10px] min-h-[465px]'>
                    {renderHomework.map((item, index) => {
                        return (
                            <HomeworkItem data={item} key={index} enrollId={enrollId} />
                        )
                    })}

                    {renderHomework.length == 0 &&
                        <div className='w-full col-span-3 hp__no-homework'>There is no homework yet.</div>
                    }
                </div>


            </div>

            {submissonTasks.length != 0 &&
                <div className='hp__submission--wrapper p-[20px]'>
                    <div className='hp__current-title mb-[15px]'>Submisson Tasks</div>

                    <div className='hp__tasks--wrapper grid grid-cols-2 gap-[10px]'>
                        {
                            submissonTasks.map((item, index) => {
                                return (
                                    <SubmissionTask data={item} key={index} enrollId={enrollId} />
                                )
                            })
                        }
                    </div>
                </div>
            }
        </div>
    )
}

function HomeworkItem({ data, enrollId }) {
    const navigate = useNavigate();

    const handleAttempHomework = () => {
        const sessionId = CreateRandom();
        sessionStorage.setItem(sessionId, enrollId);

        if (data.type == 1) {
            navigate(`/assignment?id=${sessionId}&homeworkId=${data.homeworkId}&mode=1`);
        }
        else {
            navigate(`/examination/prepare-homework?id=${sessionId}&homeworkId=${data.homeworkId}`)
        }
    }
    return (
        <div className='hpi--wrapper flex flex-col'>
            <div className='flex w-full justify-center mb-[10px]'>
                <img src={data.image ? APP_URL + data.image : IMG_URL_BASE + "English-1364-1625314122.jpg"} className='hpi__img'></img>
            </div>
            <div className='hpi__name'>{data.title}</div>

            <div className='flex items-center'>
                <div className='hpi__title'>Time</div>
                <div className='hpi__value'>{data.time}</div>
            </div>

            <div className='flex items-center'>
                <div className='hpi__title'>Late</div>
                <div className='hpi__value'>{data.lateSubmitDays}</div>
            </div>
            <div className='flex items-center'>
                <div className='hpi__title'>Pass rate</div>
                <div className='hpi__value'>{data.achieved_Percentage}</div>
            </div>

            <div className='flex items-center'>
                <div className='hpi__title'>Start date</div>
                <div className='hpi__value'>{data.startTime}</div>
            </div>

            <div className='flex items-center'>
                <div className='hpi__title'>End date</div>
                <div className='hpi__value'>{data.endTime}</div>
            </div>

            {
                data.status == 0 ?
                    <button className='hpi__btn waiting'>Waiting Open</button>
                    :
                    data.status == 1 ?
                        <button className='hpi__btn' onClick={handleAttempHomework}>Attemp Now</button>
                        :
                        data.status == 2 ?
                            <button className='hpi__btn late' onClick={handleAttempHomework}>Attemp Late</button>
                            :
                            <button className='hpi__btn overdue' onClick={handleAttempHomework}>Overdue</button>
            }
        </div>
    )
}

function SubmissionTask({ data, enrollId }) {
    const [files, setFiles] = useState([]);
    const [fileName, setFileName] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [showFiles, setShowFiles] = useState(false);
    const inputFileRef = useRef(null);

    const handleImportFile = (event) => {
        inputFileRef.current.click();
    }

    const handleChangeFile = (event) => {
        setFiles(event.target.files);
        const names = Array.from(event.target.files).map((file) => file.name);
        setFileName(names.join(", "));
    }

    const handleChangeLink = (event) => {
        setLinkUrl(event.target.value);
    }

    const handleSubmitFiles = () => {
        const handleSubmit = async () => {
            try {
                if (files.length == 0 && (linkUrl == "" || linkUrl == null)) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "File or Link Url is required",
                        duration: 4000
                    });
                    return;
                }

                const formData = new FormData();
                formData.append("linkUrl", linkUrl);
                formData.append("enrollId", enrollId);
                formData.append("SubmissionTaskId", data.submissionId);

                Array.from(files).forEach((file, index) => {
                    formData.append(`files`, file);
                });

                const response = await appClient.post(`api/SubmissionFiles/files`, formData);
                const resData = response.data;

                if (resData.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Uploaded files successfully",
                        duration: 4000
                    });
                }

                setFiles([]);
                setFileName("");
                setLinkUrl("");
            }
            catch {

            }
        }

        handleSubmit();
    }

    const handleShowFiles = () => {
        setShowFiles(true);
    }

    return (
        <div>
            <div className='hps__item--wrapper'>
                <div className='hps__title mb-[10px]'>
                    {data.title}
                </div>
                <div className='hps__description mb-[5px]'>
                    {data.description}
                </div>

                <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                        <div className='hps__title-info'>Lesson day</div>
                        <div className='hps__value-info'>{data.lesson.dayOfWeek}</div>
                    </div>
                    <div className='flex items-center'>
                        <div className='hps__title-info'>Lesson date</div>
                        <div className='hps__value-info'>{data.lesson.date.split("-").reverse().join("-")}</div>
                    </div>
                </div>

                <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                        <div className='hps__title-info'>Start date</div>
                        <div className='hps__value-info'>{data.startTime}</div>
                    </div>
                    <div className='flex items-center'>
                        <div className='hps__title-info'>End date</div>
                        <div className='hps__value-info'>{data.endTime}</div>
                    </div>
                </div>

                <div className='flex items-center mt-[10px]'>
                    <div className='hps__file-text flex items-center cursor-pointer' onClick={handleImportFile}>
                        <img src={IMG_URL_BASE + "upload-icon.svg"} className='w-[20px] mr-[5px]' />
                        <span>Files</span>
                    </div>
                    <input type='file' className='hidden' ref={inputFileRef} onChange={handleChangeFile} multiple={true} />
                    <input className='hps__input flex-1' placeholder='Import some file ...' value={fileName} readOnly />
                </div>

                <div className='flex items-center mt-[10px]'>
                    <div className='hps__file-text flex items-center'>
                        <img src={IMG_URL_BASE + "link-icon.svg"} className='w-[20px] mr-[5px]' />
                        <span>Link</span>
                    </div>

                    <input className='hps__input link flex-1' placeholder='Import link ...' value={linkUrl} onChange={handleChangeLink} />
                </div>

                <div className='flex justify-between items-center mt-[20px]'>
                    <button className='hps__btn flex-1 mr-[10px]' onClick={handleSubmitFiles}>Submit</button>
                    <button className='hps__btn flex-1 ml-[10px] view' onClick={handleShowFiles}>View</button>
                </div>
            </div>

            {showFiles && <SubmissionFiles onShowFiles={setShowFiles} data={data} enrollId={enrollId} />}
        </div>
    )
}

function SubmissionFiles({ onShowFiles, data, enrollId }) {
    const [fileInfos, setFileInfos] = useState([]);
    const [fileName, setFileName] = useState("");
    const [importFile, setImportFile] = useState(null);
    const [linkUrl, setLinkUrl] = useState("");

    const handleGetSubmitedFiles = async () => {
        try {
            const response = await appClient.get(`api/SubmissionFiles/tasks/${data.submissionId}?enrollId=${enrollId}`);
            const resData = response.data;
            if (resData.success) {
                setFileInfos(resData.message);
            }
        }
        catch {

        }
    }

    useEffect(() => {
        handleGetSubmitedFiles();
    }, [])

    const GetFileNameWithoutPrefix = (path) => {
        const fileName = path.split('/').pop();
        return fileName.replace(/^.*?_/, '');
    };

    const handleDeleteFile = (id) => {
        const handleDelete = async () => {
            try {
                const response = await appClient.delete(`api/SubmissionFiles/${id}`);
                const resData = response.data;

                if (resData.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Delete file successfully",
                        duration: 4000
                    });

                    let newFileInfos = fileInfos.filter((item) => item.submissionFileId != id);
                    setFileInfos(newFileInfos);
                }
            }
            catch {

            }
        }

        handleDelete();
    }

    const handleUploadFile = (event) => {
        let file = event.target.files[0];

        if (file) {
            setImportFile(file);
            setFileName(file.name);
        }
        else {
            setImportFile(null);
            setFileName("");
        }
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleDropFile = (event) => {
        event.preventDefault();
        let file = event.dataTransfer.files[0];

        if (file) {
            setImportFile(file);
            setFileName(file.name);
        }
        else {
            setImportFile(null);
            setFileName("");
        }
    }

    const handleSubmitFile = () => {
        const handleSubmit = async () => {
            try {
                if (importFile == null && (linkUrl == "" || linkUrl == null)) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "File or Link Url is required",
                        duration: 4000
                    });
                    return;
                }

                const formData = new FormData();
                formData.append("linkUrl", linkUrl);
                formData.append("enrollId", enrollId);
                formData.append("SubmissionTaskId", data.submissionId);
                formData.append("file", importFile);

                const response = await appClient.post(`api/SubmissionFiles`, formData);
                const resData = response.data;

                if (resData.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Uploaded files successfully",
                        duration: 4000
                    });
                }

                setImportFile(null);
                setFileName("");
                setLinkUrl("");
                handleGetSubmitedFiles();
            }
            catch {

            }
        }

        handleSubmit();
    }

    return (
        <div className='hpsf__list--wrapper fixed top-0 left-0 w-full h-full z-[1000] flex justify-center items-center' onClick={(e) => onShowFiles(false)}>
            <div className='w-[850px] h-[530px] bg-white hpsf__list-content flex flex-col' onClick={(e) => e.stopPropagation()}>
                <div className='flex justify-between items-center pl-[20px] py-[10px] pr-[10px] border-b'>
                    <div className='hpsf__header-title'>Files Import</div>
                    <div className='p-[10px] cursor-pointer' onClick={(e) => onShowFiles(false)} >
                        <img src={IMG_URL_BASE + "close.svg"} className='w-[20px]' />
                    </div>
                </div>

                <div className='h-[100px] border-[2px] border-dashed m-[20px] rounded-[8px] mb-0 flex'>
                    <label
                        htmlFor='input-file'
                        id="drop-area"
                        className='flex-1 bg-blue-50 flex justify-center items-center flex-col cursor-pointer'
                        onDragOver={handleDragOver}
                        onDrop={handleDropFile}>
                        <input type='file' className='hidden' id="input-file" onChange={(e) => handleUploadFile(e)} />
                        <div>
                            <img src={IMG_URL_BASE + "upload-cloud-icon.png"} className='w-[60px]' />
                        </div>

                        {
                            fileName == "" ?
                                <div className='hpsf__drag-title font-bold'>Drag and drop or click to upload files </div>
                                :
                                <div className='hpsf__drag-title'>{fileName}</div>
                        }
                    </label>
                    <div className='flex-1 flex justify-between items-center bg-blue-50'>
                        <div className='flex flex-col justify-center items-center w-full px-[20px]'>
                            <div className='hpsf__url-title font-bold mb-[10px]'>Link to document</div>

                            <div className='flex justify-between items-center w-full'>
                                <input className='hpsf__input-url flex-1' value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />

                                <button className='px-[10px] py-[5px] ml-[10px] h-[31px] flex items-center rounded-[8px] bg-blue-200' onClick={handleSubmitFile}>
                                    <img src={IMG_URL_BASE + "plus-circle-icon.svg"} className='w-[15px]' />
                                    <div className='hpsf__btn-text'>Upload</div>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div className='p-[20px] flex-1'>
                    <div className='hpsf__body border h-full rounded-[8px] p-[15px]'>
                        <div className='flex justify-between items-center'>
                            <div className='hpsf__body-title'>
                                Uploaded File <span className='text-blue-600 font-medium'> ({fileInfos.length})</span>
                            </div>
                        </div>

                        <div className='w-full mt-[10px] overflow-scroll'>
                            {fileInfos.map((item, index) => {
                                const fileName = GetFileNameWithoutPrefix(item.filePath);
                                return (
                                    <FileItem item={item} key={index} fileName={fileName} onDeleteFile={handleDeleteFile} />
                                )
                            })}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FileItem({ item, fileName, onDeleteFile }) {
    const inputFileRef = useRef(null);
    const [editMode, setEditModel] = useState(false);
    const [linkUrl, setLinkUrl] = useState(item.linkUrl);
    const [fileNameAfter, setFileNameAfter] = useState(fileName);
    const [importFile, setImportFile] = useState(null);
    const ImageWithExtension = (filePath) => {
        const extension = filePath.split('.').pop().toLowerCase();

        return `${IMG_URL_BASE + extension}-icon.svg`;
    }

    const handleErrorImage = (event) => {
        event.target.src = `${IMG_URL_BASE + "default-icon.svg"}`;
    }

    const handleSelectFile = () => {
        setEditModel(true);
    }

    const handleSaveFile = () => {
        const handleUpdateFile = async () => {
            try {
                if ((linkUrl == "" || linkUrl == null) && (fileNameAfter == "" || fileNameAfter == "")) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "File or Link Url is required",
                        duration: 4000
                    });

                    return;
                }

                if (importFile) {
                    const formData = new FormData();
                    formData.append("file", importFile);

                    let response = await appClient.patch(`api/SubmissionFiles/${item.submissionFileId}/file`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        }
                    });
                    let resData = response.data;
                    if (!resData.success) {
                        toast({
                            type: "error",
                            title: "Error",
                            message: resData.message,
                            duration: 4000
                        });
                        return;
                    }
                }

                let response = await appClient.patch(`api/SubmissionFiles/${item.submissionFileId}/link-url`, linkUrl,
                    {
                        headers: {
                            "Content-Type": 'application/json',
                        },
                    });

                let resData = response.data;

                if (resData.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Update file successfully",
                        duration: 4000
                    });
                }
            }
            catch {

            }
        }


        handleUpdateFile();

        setEditModel(false);
    }

    const handleImportFile = () => {
        if (inputFileRef) {
            inputFileRef.current.click();
        }
    }

    const handleChangeFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImportFile(file);
            setFileNameAfter(file.name);
        }
    }

    const handleDeleteFile = () => {
        onDeleteFile(item.submissionFileId);
    }

    return (
        <div className={`hpsf__item-file--wrapper w-full flex items-center ${editMode ? "edit" : ""}`}>
            <div className='hpsf__item-name flex items-center p-[8px] w-1/2'>
                <img src={ImageWithExtension(fileNameAfter)} className='w-[25px] min-w-[25px]' onError={handleErrorImage} />
                {editMode == false ?
                    <div className='flex flex-col ml-[5px] overflow-hidden flex-1'>
                        <div className='line-clamp-1 flex-1'>{fileNameAfter}</div>
                        <div className='line-clamp-1 flex-1'>
                            {linkUrl}
                        </div>
                    </div>
                    :
                    <div className='flex flex-col ml-[5px] overflow-hidden flex-1'>
                        <div className='flex items-center'>
                            <button className='p-[10px]' onClick={handleImportFile}>
                                <img src={IMG_URL_BASE + "upload-icon.svg"} className='w-[20px]' />
                            </button>
                            <input type='file' className='hidden' ref={inputFileRef} onChange={handleChangeFile} />
                            <input className='flex-1 hpsf__item-link' readOnly placeholder='Import some files...' value={fileNameAfter} />
                        </div>
                        <div className='flex items-center'>
                            <div className='p-[10px]'>
                                <img src={IMG_URL_BASE + "link-icon.svg"} className='w-[20px]' />
                            </div>

                            <input className='hpsf__item-link flex-1' placeholder='Import link ...' value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                        </div>
                    </div>
                }
            </div>

            <div className="hpsf__item-size w-1/12">
                {item.fileSize}
            </div>

            <div className='hpsf__item-status w-1/12'>
                {item.status}
            </div>

            <div className='hpsf__item-at w-1/6'>
                {item.uploadAt}
            </div>

            <div className='w-1/6 flex justify-center items-center'>
                {editMode == false && <button className='hpsf__item-btn text-blue-700' onClick={handleSelectFile}>Select</button>}
                {editMode == true && <button className='hpsf__item-btn text-blue-700' onClick={handleSaveFile}>Update</button>}
                <button className='hpsf__item-btn text-red-700' onClick={handleDeleteFile}>Delete</button>
            </div>
        </div>
    )
}

export default HomeworkPage