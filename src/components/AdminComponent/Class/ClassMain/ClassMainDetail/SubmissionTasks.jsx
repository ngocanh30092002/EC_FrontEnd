import React, { useEffect, useRef, useState } from 'react'
import toast from '@/helper/Toast';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import DropDownList from '../../../../CommonComponent/DropDownList';

function SubmissionTasks({ lessonId, submissionTasks, onReloadTasks }) {
    const [renderTasks, setRenderTasks] = useState(submissionTasks);
    const [selectedFilter, setSelectedFilter] = useState(0);

    function parseDate(dateString) {
        const [time, date] = dateString.split(" ");
        const [day, month, year] = date.split("-").map(num => parseInt(num, 10));
        const [hour, minute, second] = time.split(":").map(num => parseInt(num, 10));
        return new Date(year, month - 1, day, hour, minute, second);
    }

    useEffect(() => {
        setRenderTasks([...submissionTasks]);
    }, [submissionTasks])

    useEffect(() => {
        let newRenderTasks = submissionTasks;
        const currentDate = new Date();

        if (selectedFilter == 1) {
            newRenderTasks = submissionTasks.filter(i => {
                const startDate = parseDate(i.startTime);
                return currentDate < startDate
            })
        }
        if (selectedFilter == 2) {
            newRenderTasks = submissionTasks.filter(i => {
                const startDate = parseDate(i.startTime);
                const endDate = parseDate(i.endTime);
                return startDate <= currentDate && currentDate <= endDate;
            })
        }
        if (selectedFilter == 3) {
            newRenderTasks = submissionTasks.filter(i => {
                const endDate = parseDate(i.endTime);
                return currentDate >= endDate;
            })
        }

        setRenderTasks(newRenderTasks)

    }, [selectedFilter])

    const dataFilter = [
        {
            key: "All",
            value: 0
        },
        {
            key: "Waiting",
            value: 1
        },
        {
            key: "Ongoing",
            value: 2
        },
        {
            key: "Overdue",
            value: 3
        },
    ]

    const handleSelectedFilter = (item, index) => {
        setSelectedFilter(item?.value);
    }

    console.log(renderTasks);
    return (
        <>
            {
                submissionTasks.length != 0 &&
                <div className='st__wrapper mt-[10px] px-[20px] w-full h-full overflow-visible min-h-[300px]'>
                    <div className='flex justify-between items-center my-[20px] overflow-visible'>
                        <div>
                            <div className='st__title'>Submission Tasks</div>
                        </div>
                        <div className='flex items-center overflow-visible w-[150px]'>
                            <div className='st__filter-title'>Filter: </div>
                            <DropDownList data={dataFilter} defaultIndex={0} hideDefault={true} onSelectedItem={handleSelectedFilter} className={"border !py-[8px] flex-1 "} />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        {renderTasks.map((item, index) => {
                            return (
                                <SubmissionTaskItem key={index} taskInfo={item} onReloadTasks={onReloadTasks} />
                            )
                        })}
                    </div>
                </div>
            }
        </>
    )
}

function SubmissionTaskItem({ taskInfo, onReloadTasks }) {
    const [title, setTitle] = useState(taskInfo.title);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(taskInfo.description);
    const [isShowFiles, setIsShowFiles] = useState(false);
    const parseDate = (dateStr) => {
        const [time, date] = dateStr.split(' ');

        const [day, month, year] = date.split('-');

        return new Date(`${year}-${month}-${day}T${time}`);
    }
    const [startDate, setStartDate] = useState(() => {
        const date = parseDate(taskInfo.startTime);

        const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
        return formattedDateTime;
    })
    const [endDate, setEndDate] = useState(() => {
        const date = parseDate(taskInfo.endTime);

        const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
        return formattedDateTime;
    })
    const inputTitleRef = useRef(null);
    const inputDesRef = useRef(null);
    const inputEndTimeRef = useRef(null);
    const inputStartTimeRef = useRef(null);

    const handleEditTask = async () => {
        if (!isEditing) {
            setIsEditing(!isEditing);
        }
        else {
            var confirmAnswer = confirm("Are you sure to update submission task?");
            if (confirmAnswer) {
                try {
                    if (inputTitleRef.current && (inputTitleRef.current.value == null || inputTitleRef.current.value == "")) {
                        toast({
                            type: "error",
                            title: "ERROR",
                            message: "Title is required",
                            duration: 4000
                        });

                        inputTitleRef.current.classList.toggle("error");

                        setTitle(taskInfo.title);

                        setTimeout(() => {
                            inputTitleRef.current.classList.toggle("error")
                        }, (2000));

                        setIsEditing(false);
                        return;
                    }

                    const startTime = new Date(startDate);
                    const endTime = new Date(endDate);

                    if (startTime.getTime() > endTime.getTime()) {
                        toast({
                            type: "error",
                            title: "ERROR",
                            message: "Start date must be less than End date",
                            duration: 4000
                        });

                        inputStartTimeRef.current.classList.toggle("error");

                        setStartDate(prev => {
                            const date = new Date(taskInfo.startTime);
                            const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                            const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
                            return formattedDateTime;
                        })

                        setEndDate(prev => {
                            const date = new Date(taskInfo.endTime);
                            const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                            const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
                            return formattedDateTime;
                        })

                        setIsEditing(false);
                        setTimeout(() => {
                            inputStartTimeRef.current.classList.toggle("error")
                        }, (2000));

                        return;
                    }

                    if (startTime.getTime() == endTime.getTime()) {
                        toast({
                            type: "warning",
                            title: "Warning",
                            message: "Users need some time to submit their work.",
                            duration: 4000
                        });

                        return;
                    }

                    const formData = new FormData();
                    formData.append("LessonId", taskInfo.lessonId);
                    formData.append("Title", inputTitleRef.current.value);
                    formData.append("StartTime", startDate);
                    formData.append("EndTime", endDate);

                    if (inputDesRef.current.value) {
                        formData.append("Description", inputDesRef.current.value);
                    }

                    const response = await appClient.put(`api/SubmissionTasks/${taskInfo.submissionId}`, formData);
                    const data = response.data;
                    if (data.success) {
                        toast({
                            type: "success",
                            title: "Success",
                            message: "Update task successfully",
                            duration: 4000
                        });

                        onReloadTasks()
                        setIsEditing(false);
                    }

                }
                catch {

                }
            }
        }


    }

    const handleDeleteTask = async () => {
        try {
            const confirmAnswer = confirm("Are you want to delete this task ?");
            if (confirmAnswer) {
                let response = await appClient.delete(`api/SubmissionTasks/${taskInfo.submissionId}`);
                let data = response.data;
                if (data.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Delete task successfully",
                        duration: 4000
                    });

                    onReloadTasks();
                }
            }
        }
        catch {

        }
    }

    const handleShowView = () => {
        setIsShowFiles(true);
    }

    useEffect(() => {
        setTitle(taskInfo.title);
        setDescription(taskInfo.description);

        setStartDate(prev => {
            const date = parseDate(taskInfo.startTime);
            const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
            return formattedDateTime;
        })

        setEndDate(prev => {
            const date = parseDate(taskInfo.endTime);
            const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
            return formattedDateTime;
        })
    }, [taskInfo])

    return (
        <div className='sti__wrapper flex items-center flex-col w-full border rounded-[8px] h-full p-[20px] relative'>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                readOnly={!isEditing}
                ref={inputTitleRef}
                className='sti__title-input w-full text-center'
                placeholder='Enter your title'
            />
            <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                readOnly={!isEditing}
                ref={inputDesRef}
                className='sti__des-input'
                placeholder='Enter your description'
            />

            <div className='flex justify-between w-full mt-[10px]'>
                <div className='flex items-center'>
                    <div className='sti__header-name'>Start:</div>
                    <input
                        ref={inputStartTimeRef}
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        readOnly={!isEditing}
                        className='sti__time-input'
                    />
                </div>

                <div className='flex items-center'>
                    <div className='sti__header-name'>End:</div>
                    <input
                        ref={inputEndTimeRef}
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        readOnly={!isEditing}
                        className='sti__time-input'
                    />
                </div>
            </div>

            <div className='flex w-full justify-between mt-[20px]'>
                <button className='sti__btn-fun flex-1 mr-[10px]' onClick={handleShowView}>View</button>
                <button className='sti__btn-fun flex-1 delete' onClick={handleDeleteTask}>Delete</button>
            </div>

            <div className='absolute top-0 right-0 p-[10px] cursor-pointer' onClick={handleEditTask}>
                {!isEditing ?
                    <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[20px]' />
                    :
                    <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[25px]' />}
            </div>

            {isShowFiles == true && <SubmissionFilesBoard onShowFile={setIsShowFiles} submissionId={taskInfo.submissionId} />}
        </div>
    )
}

function SubmissionFilesBoard({ submissionId, onShowFile }) {
    const [files, setFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 5;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(files.length / rowPerPage);

    const handleGetNameFile = (str) => {
        const fileName = str.split("/").pop();
        const extractedPart = fileName.substring(fileName.indexOf('_') + 1);

        return extractedPart;
    }

    const getFiles = async () => {
        try {
            const response = await appClient.get(`api/SubmissionFiles/submissions/${submissionId}`);
            const data = response.data;
            if (data.success) {
                setFiles(data.message.map((item, index) => {
                    return {
                        ...item,
                        index: index + 1,
                        fileName: handleGetNameFile(item.filePath),
                        type: getFileCategory(item.filePath)
                    }
                }));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getFiles();
    }, [])

    const removeVietnameseAccents = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }

    const handleSort = (key, event) => {
        setSortConfig(prevConfig => {
            const existingIndex = prevConfig.findIndex((item) => item.key === key);
            event.target.classList.add("active");

            if (existingIndex > -1) {
                const updatedConfig = [...prevConfig];
                const currentDirection = updatedConfig[existingIndex].direction;

                if (currentDirection === 'desc') {
                    updatedConfig[existingIndex].direction = 'asc';
                    event.target.classList.remove("desc");
                } else {
                    updatedConfig.splice(existingIndex, 1);
                    event.target.classList.toggle("active");
                }

                return updatedConfig;
            }

            event.target.classList.add("desc");
            return [...prevConfig, { key, direction: 'desc' }];
        });
    }

    const getValueByPath = (object, path) => {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
    };

    const sortedDataFunc = () => {
        if (sortConfig.length === 0) return [...files];

        return [...files].sort((a, b) => {
            for (const { key, direction } of sortConfig) {
                const valueA = getValueByPath(a, key);
                const valueB = getValueByPath(b, key);

                if (valueA == null && valueB == null) {
                    continue;
                }
                if (valueA == null) {
                    return direction === "asc" ? -1 : 1;
                }
                if (valueB == null) {
                    return direction === "asc" ? 1 : -1;
                }

                if (valueA < valueB) {
                    return direction === "asc" ? -1 : 1;
                }
                if (valueA > valueB) {
                    return direction === "asc" ? 1 : -1;
                }
            }
            return 0;
        });
    };


    const ImageWithExtension = (filePath) => {
        const extension = filePath.split('.').pop().toLowerCase();

        return `${IMG_URL_BASE + extension}-icon.svg`;
    }

    const handleErrorImage = (event) => {
        event.target.src = `${IMG_URL_BASE + "file-icon.svg"}`;
    }

    const getFileCategory = (fileName) => {
        if (!fileName) return "File";

        const extension = fileName.split('.').pop();

        const fileCategories = {
            image: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
            audio: ["mp3", "wav", "ogg", "flac", "aac", "m4a"],
            video: ["mp4", "mkv", "avi", "mov", "wmv", "flv"],
            document: ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"],
            compressed: ["zip", "rar", "7z", "tar", "gz"],
            executable: ["exe", "sh", "bat"],
            others: []
        };

        for (const [category, extensions] of Object.entries(fileCategories)) {
            if (extensions.includes(extension.toLowerCase())) {
                return category.charAt(0).toUpperCase() + category.slice(1);
            }
        }

        return "File";
    };


    const handleChangePage = (event) => {
        if (event.target.value == "") {
            setCurrentPage(1);
        }
        else {
            setCurrentPage(event.target.value.replace(/[^0-9]/g, ''));
        }
    }

    const handleInputPage = (event) => {
        setCurrentPage(currentPage.replace(/[^0-9]/g, ''));
    }

    const handleReloadFiles = () => {
        getFiles();
    }

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [files, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.fileName).toLowerCase();
                    const search = removeVietnameseAccents(searchValue.toLowerCase());
                    return fullName.includes(search);
                })

                return newPrev;
            })
        }
        else {
            setSortedData(sortedDataFunc());
        }
    }, [searchValue]);


    const handleRemoveFile = async (event, item) => {
        event.stopPropagation();
        event.preventDefault();

        try {
            var confirmAnswer = confirm("Are you want to remove this file ?");
            if (confirmAnswer) {

                const response = await appClient.delete(`api/SubmissionFiles/${item.submissionFileId}`);
                const dataRes = response.data;
                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Delete file successfully",
                        duration: 4000
                    });
                    handleReloadFiles();
                }

            }

        }
        catch {

        }
    }

    return (
        <div className='fixed top-0 left-0 w-full flex items-center justify-center h-full sfb__wrapper z-[1000]' onClick={(e) => onShowFile(false)}>
            <div className='sfb__content__wrapper w-[1200px] h-[600px] flex flex-col bg-white rounded-[10px] p-[20px]' onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <div className="sfb__title">Submited Files</div>
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                </div>

                <div className='cmp__tbl mt-[10px] flex flex-col flex-1'>
                    <div className='cmp__tbl__header flex w-full mb-[10px]'>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("index", event)}>No</div>
                        <div className='mpt__header-item w-1/4' onClick={(event) => handleSort("fileName", event)}>File Name</div>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("type", event)}>Type</div>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("fileSize", event)}>Size</div>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("status", event)}>Status</div>
                        <div className='mpt__header-item w-1/6' onClick={(event) => handleSort("uploadAt", event)}>Upload At</div>
                        <div className='mpt__header-item w-1/6' onClick={(event) => handleSort("userName", event)}>Upload By</div>
                        <div className='mpt__header-item w-1/12'></div>
                    </div>

                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <a className='cmp__tbl__row flex w-full items-center' key={index} href={APP_URL + item.filePath} target='_blank'>
                                <div className='cmp__tbl__row-item w-1/12 !text-[12px]'># {item.index}</div>

                                <div className='cmp__tbl__row-item  w-1/4 flex items-center'>
                                    <div>
                                        <img onError={handleErrorImage} src={ImageWithExtension(item.filePath)} className='w-[30px] object-fill' />
                                    </div>
                                    <div className='flex flex-col justify-between'>
                                        <div className='ml-[5px] line-clamp-1 cmp__row-item--title !p-0 !text-[12px]'>{item.fileName}</div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <a className='ml-[5px] line-clamp-1 cmp__row-item--title !p-0 !text-[12px] underline  text-blue-500' href={item.linkUrl} target='_blank'>
                                                {item.linkUrl}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/12'>{item.type}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/12'>{item.fileSize}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/12'>{item.status}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/6'>{item.uploadAt}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/6 flex items-center'>
                                    <img src={APP_URL + item.userImage} className='w-[30px] h-[30px] object-cover rounded-[50%]' />
                                    <div className='ml-[10px] sfb__userName line-clamp-1'>{item.userName}</div>
                                </div>

                                <div className='cmp__tbl__header-item w-1/12 flex items-center' onClick={(e) => e.stopPropagation()}>
                                    <button onClick={(e) => handleRemoveFile(e, item)} className='mpt__item--btn' >
                                        <img src={IMG_URL_BASE + "close.svg"} className='w-[30px] p-[6px]' />
                                    </button>
                                </div>
                            </a>
                        )
                    })}

                    {sortedData.length == 0 &&
                        <div className='sfb__no-file'>
                            No files have been submitted yet.
                        </div>
                    }
                </div>

                <div className='flex justify-end items-center mt-[20px]'>
                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => 1)}>
                        <img src={IMG_URL_BASE + "previous.svg"} className="w-[20px] " />
                    </button>

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => {

                        return prev == 1 ? 1 : parseInt(prev) - 1;
                    })}>
                        <img src={IMG_URL_BASE + "pre_page_icon.svg"} className="w-[20px]" />
                    </button>

                    <input className='mpt__page-input' value={currentPage} onChange={handleChangePage} onInput={handleInputPage} />

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => parseInt(prev) + 1)}>
                        <img src={IMG_URL_BASE + "next_page_icon.svg"} className="w-[20px]" />
                    </button>

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => totalPage)}>
                        <img src={IMG_URL_BASE + "next.svg"} className="w-[20px]" />
                    </button>
                </div>

            </div>
        </div>
    )
}



export default SubmissionTasks