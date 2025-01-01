import React, { useEffect, useState } from 'react'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '../../../../helper/Toast';
import ClassAddBroad from './ClassAddBroad';
import { useNavigate } from 'react-router-dom';
import LoaderPage from '../../../LoaderComponent/LoaderPage';

function ClassListBroad() {
    const [isShowClassBoard, setIsShowClassBroad] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [classes, setClasses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(classes.length / rowPerPage);

    const getClassesInfo = async () => {
        try {
            const response = await appClient.get("api/classes");
            const dataRes = response.data;
            if (dataRes.success) {
                setClasses(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
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

    const handleDeleteClass = (classId) => {
        let newClasses = classes.filter(c => c.classId != classId);
        newClasses = newClasses.map((item, index) => ({ ...item, index: index + 1 }));
        setClasses(newClasses);
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
        if (sortConfig.length === 0) return [...classes];

        return [...classes].sort((a, b) => {
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
        getClassesInfo();
    }, [])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [classes, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                const newPrev = prev.filter(item => item.classId.toLowerCase().includes(searchValue.toLowerCase()));
                return newPrev;
            })
        }
        else {
            setSortedData(sortedDataFunc());
        }
    }, [searchValue])

    const handleReloadClass = () => {
        getClassesInfo();
    }

    return (
        <div className='cmp__wrapper p-[20px] h-full'>
            <div className='flex justify-between items-center'>
                <div className='cmp__title'>List of Classes</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    <button className='cmp__add-class--btn' onClick={(e) => setIsShowClassBroad(!isShowClassBoard)}>
                        {
                            !isShowClassBoard ?
                                "Add Class"
                                :
                                "Hide Board"
                        }
                    </button>
                </div>
            </div>
            <ClassAddBroad isShow={isShowClassBoard} onShow={setIsShowClassBroad} onReloadClass={handleReloadClass} />

            <div className='clb__wrapper'>
                <div className="clb__tbl__wrapper mt-[20px]">
                    <div className="mpt__header flex w-full">
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                        <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("classId", event)}>Class Name</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("teacher.fullName", event)}>Teacher</div>
                        <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("startDate", event)}>Start Date</div>
                        <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("endDate", event)}>End Date</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("status", event)}>Status</div>
                        <div className="mpt__header-item w-1/12"></div>
                    </div>

                    <div className='mpt__body min-h-[390px] mt-[10px]'>
                        {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                            return (
                                <ClassItem
                                    classInfo={item}
                                    key={index}
                                    index={item.index}
                                    onDeleteClass={handleDeleteClass}
                                />
                            )
                        })}
                    </div>

                    <div className='flex justify-end items-center mt-[20px]'>
                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => 1)}>
                            <img src={IMG_URL_BASE + "previous.svg"} className="w-[25px] " />
                        </button>

                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => {

                            return prev == 1 ? 1 : parseInt(prev) - 1;
                        })}>
                            <img src={IMG_URL_BASE + "pre_page_icon.svg"} className="w-[25px]" />
                        </button>

                        <input className='mpt__page-input' value={currentPage} onChange={handleChangePage} onInput={handleInputPage} />

                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => parseInt(prev) + 1)}>
                            <img src={IMG_URL_BASE + "next_page_icon.svg"} className="w-[25px]" />
                        </button>

                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => totalPage)}>
                            <img src={IMG_URL_BASE + "next.svg"} className="w-[25px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ClassItem({ classInfo, index, onDeleteClass }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleShowClassInfo = () => {
        setIsShow(true);

        navigate(`${classInfo.classId}/detail`);
    }
    const handleRemoveClick = async (event) => {
        event.stopPropagation();
        try {
            var confirmAnswer = confirm("Are you sure to delete this classes");
            if (!confirmAnswer) return;

            setIsLoading(true);

            const response = await appClient.delete(`api/classes/${classInfo.classId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Delete class successfully",
                    duration: 4000
                });

                onDeleteClass(classInfo.classId);
                setIsLoading(false);

                return;
            }
        }
        catch {
            setIsLoading(false);
        }
    }
    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px] ${isEditing && "editing"}`} onClick={handleShowClassInfo}>
                <div className="mpt__row-item w-1/12 "># {index}</div>
                <div className="mpt__row-item w-1/6 flex items-center ">
                    <div className='mpt__row-item-classInfo'>{classInfo.classId}</div>
                    <div className='mpt__row-item-seperate'>-</div>
                    <div className='mpt__row-item-classInfo'>{classInfo.courseId}</div>
                </div>
                <div className="mpt__row-item w-1/4 flex">
                    <div>
                        <img src={classInfo?.teacher?.imageUrl ? APP_URL + classInfo.teacher?.imageUrl : IMG_URL_BASE + "unknown_user.jpg"} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                    </div>
                    <div className='flex-1'>
                        <div className='line-clamp-1 cabf__ti--text'>{classInfo.teacher.fullName}</div>
                        <div className='line-clamp-1 cabf__ti--text'>{classInfo.teacher.email}</div>
                    </div>
                </div>
                <div className="mpt__row-item w-1/6 ">
                    {classInfo.startDate}
                </div>
                <div className="mpt__row-item w-1/6 ">
                    {classInfo.endDate}
                </div>
                <div className="mpt__row-item w-1/12 ">
                    {classInfo.status}
                </div>
                <div className='mpt__row-item w-1/12 flex justify-end'>
                    <button className='mpt__item--btn' onClick={handleRemoveClick}>
                        <img src={IMG_URL_BASE + "close.svg"} className='w-[25px] p-[3px]' />
                    </button>
                </div>
            </div>

            {isLoading && <LoaderPage/>}
        </>
    )
}

export default ClassListBroad