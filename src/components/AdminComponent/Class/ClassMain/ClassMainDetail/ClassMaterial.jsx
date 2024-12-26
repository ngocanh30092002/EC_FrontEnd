import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import "@components/DashboardComponent/Class/ClassStyle.css"
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from '../../../../CommonComponent/DropDownList';
import toast from '../../../../../helper/Toast';

function ClassMaterial() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 5;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(materials.length / rowPerPage);

    const getMaterials = async () => {
        const response = await appClient.get(`api/classmaterials/classes/${classId}`);
        const data = response.data;
        if (data.success) {
            setMaterials(data.message);
        }
    }

    useEffect(() => {
        if (classId == null) {
            navigate(-1);
            return;
        }

        getMaterials();
    }, [])

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

    const handleRemoveFile = async (event, item) => {
        event.stopPropagation();
        event.preventDefault();

        try {
            const response = await appClient.delete(`api/classmaterials/${item.classMaterialId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Delete file successfully",
                    duration: 4000
                });

                let newMaterial = materials.filter(i => i.classMaterialId != item.classMaterialId)
                newMaterial.map((item,index) => ({...item,index: index + 1}));
                setMaterials(newMaterial);
            }
        }
        catch {

        }
    }

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
        getMaterials();
    }


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
        if (sortConfig.length === 0) return [...materials];

        return [...materials].sort((a, b) => {
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

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [materials, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.title).toLowerCase();
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


    return (
        <div className='px-[20px] cmp__wrapper'>
            <div className='w-full flex justify-between'>
                <div className="flex items-center">
                    <div className='mpt__header-item--search-icon'>
                        <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                    </div>
                    <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                </div>
                <button className='sp__add-schedule--btn' onClick={(e) => setIsShowBoard(!isShowBoard)}>
                    {
                        !isShowBoard ?
                            "Upload File"
                            :
                            "Hide board"
                    }
                </button>
            </div>

            {isShowBoard && <MaterialAddBoard onShow={setIsShowBoard} classId={classId} onReload={handleReloadFiles} />}


            <div className='cmp__tbl mt-[10px]'>
                <div className='cmp__tbl__header flex w-full mb-[10px]'>
                    <div className='mpt__header-item w-1/4' onClick={(event) => handleSort("title", event)}>File Name</div>
                    <div className='mpt__header-item w-1/12' >Type</div>
                    <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("fileSize", event)}>Size</div>
                    <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("type", event)}>Belong</div>
                    <div className='mpt__header-item w-1/6' onClick={(event) => handleSort("lessonDate", event)}>Lesson Date</div>
                    <div className='mpt__header-item w-1/4' onClick={(event) => handleSort("uploadBy", event)}>Upload By</div>
                    <div className='mpt__header-item w-1/12'></div>
                </div>

                <div className='mpt__body min-h-[255px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <a className='cmp__tbl__row flex w-full items-center' key={index} href={APP_URL + item.filePath} target='_blank'>
                                <div className='cmp__tbl__row-item  w-1/4 flex items-center'>
                                    <div>
                                        <img onError={handleErrorImage} src={ImageWithExtension(item.filePath)} className='w-[30px] object-fill' />
                                    </div>
                                    <div className='ml-[5px] line-clamp-1 cmp__row-item--title !text-[12px]'>{item.title}</div>
                                </div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/12'>{getFileCategory(item.filePath)}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/12'>{item.fileSize}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/12'>{item.type}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/6'>{item.lessonDate}</div>
                                <div className='cmp__tbl__row-item !text-[12px] w-1/4'>{item.uploadBy}</div>
                                <div className='cmp__tbl__header-item w-1/12 flex items-center' onClick={(e) => e.stopPropagation()}>
                                    <button onClick={(e) => handleRemoveFile(e, item)} className='mpt__item--btn' >
                                        <img src={IMG_URL_BASE + "close.svg"} className='w-[30px] p-[6px]' />
                                    </button>
                                </div>
                            </a>
                        )
                    })}

                    {sortedData.length == 0 &&
                        <div className='w-full h-[390px] flex items-center justify-center'>
                            <span className='er__no-enrolls'>There are no materials at this time.</span>
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

function MaterialAddBoard({ classId, onShow, onReload }) {
    const [isShowLesson, setIsShowLesson] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [importFile, setImportFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [selectedBelong, setSelectedBelong] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [defaultBelongIndex, setDefaultBelongIndex] = useState(-1);
    const [defaultLessonIndex, setDefaultLessongIndex] = useState(-1);
    const [isCorrectBelong, setIsCorrectBelong] = useState(true);
    const [isCorrectLesson, setIsCorrectLesson] = useState(true);

    const inputFileRef = useRef(null);
    const inputTitleRef = useRef(null);
    const inputFileNameRef = useRef(null);

    const belongData = [
        {
            key: "Class",
            value: 0
        },
        {
            key: "Lesson",
            value: 1
        },
    ]

    const handleSelectedBelong = (item, index) => {
        setDefaultBelongIndex(index);
        setSelectedBelong(item);

        if (item != null && item.value == 1) {
            setIsShowLesson(true);
        }

        if (item != null && item.value == 0) {
            setIsShowLesson(false);
        }

        if (item == null) {
            setIsShowLesson(false);
        }
    }

    const handleSelectedLesson = (item, index) => {
        setSelectedLesson(item);
        setDefaultLessongIndex(index);
    }
    const getLessons = async () => {
        try {
            const response = await appClient.get(`api/lessons/classes/${classId}`);
            const data = response.data;
            if (data.success) {
                setLessons(data.message);
            }
        }
        catch {
        }
    }

    const handleClearInput = () => {
        setSelectedBelong(null);
        setSelectedLesson(null);
        setDefaultBelongIndex(-1);
        setDefaultLessongIndex(-1);
        setImportFile(null);
        setFileName("");
        inputTitleRef.current.value = "";
    }


    const hanleClickToUpload = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        }
    }

    const handleChangeFile = (event) => {
        let file = event.target.files[0];

        if (file) {
            setImportFile(file);
            setFileName(file.name);
        }
    }

    const handleSubmitFile = async () => {
        if (inputTitleRef.current && (inputTitleRef.current.value == "" || inputTitleRef.current.value == null)) {
            toast({
                type: "error",
                title: "Error",
                message: "Title is required",
                duration: 4000
            });

            inputTitleRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputTitleRef.current.classList.toggle("cabf__input--error");
            }, 2000);
            return;
        }

        if (importFile == null) {
            toast({
                type: "error",
                title: "Error",
                message: "File is required",
                duration: 4000
            });

            inputFileNameRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputFileNameRef.current.classList.toggle("cabf__input--error");
            }, 2000);
            return;
        }

        if (selectedBelong == null) {
            toast({
                type: "error",
                title: "Error",
                message: "Belong is required",
                duration: 4000
            });

            setIsCorrectBelong(false);

            setTimeout(() => {
                setIsCorrectBelong(true);
            }, 2000);
            return;
        }
        else {
            if (selectedBelong.value == 1) {
                if (selectedLesson == null) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Lesson is required",
                        duration: 4000
                    });

                    setIsCorrectLesson(false);

                    setTimeout(() => {
                        setIsCorrectLesson(true);
                    }, 2000);
                    return;
                }
            }
        }


        try {
            const formData = new FormData();
            formData.append("Title", inputTitleRef.current.value);
            formData.append("File", importFile);

            if (selectedBelong.value == 0) {
                formData.append("ClassId", classId);
            }
            else {
                formData.append("LessonId", selectedLesson.value);
            }

            const response = await appClient.post("api/classmaterials", formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Upload file successfully",
                    duration: 4000
                });

                handleClearInput();
                onShow(false);
                onReload();
            }

        }
        catch {

        }
    }

    useEffect(() => {
        getLessons();
    }, [])

    return (
        <div className='w-full mt-[10px] bg-white mab__wrapper p-[20px] border rounded-[8px] overflow-visible'>
            <div className='flex items-center'>
                <div className='flex items-center flex-1'>
                    <div className='cabf__title-name'>Title</div>
                    <input className='cabf__input' ref={inputTitleRef} />
                </div>

                <div className='flex items-center flex-1'>
                    <div className='cabf__title-name'>File</div>
                    <input type='file' className='hidden' ref={inputFileRef} onChange={handleChangeFile} />
                    <input className='cabf__input cursor-pointer' ref={inputFileNameRef} value={fileName} placeholder='Import some file ...' readOnly onClick={hanleClickToUpload} />
                </div>
            </div>

            <div className='flex items-center overflow-visible mt-[20px]'>
                <div className='cabf__title-name '>Belong </div>
                <DropDownList data={belongData} defaultIndex={defaultBelongIndex} onSelectedItem={handleSelectedBelong} placeholder={"Select belong ... "} className={`border !rounded-[20px] ${isCorrectBelong == false && "!border-red-600"}`} />
            </div>


            {
                isShowLesson == true &&
                <div className='flex items-center overflow-visible mt-[20px]'>
                    <div className='cabf__title-name '>Lessons </div>
                    <DropDownList data={lessons.map((item) => ({ key: item.date, value: item.lessonId }))} onSelectedItem={handleSelectedLesson} defaultIndex={defaultLessonIndex} placeholder={"Select belong ... "} className={`border !rounded-[20px] ${isCorrectLesson == false && "!border-red-600"}`} />
                </div>
            }

            <div className='flex justify-end items-center mt-[20px]'>
                <button className='sab__btn-func mr-[20px]' onClick={handleSubmitFile}>Submit</button>
                <button className='sab__btn-func' onClick={handleClearInput}>Clear</button>
            </div>
        </div>
    )
}
export default ClassMaterial