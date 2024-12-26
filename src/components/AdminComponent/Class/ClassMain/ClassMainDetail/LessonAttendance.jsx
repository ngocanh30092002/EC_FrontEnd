import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';

function LessonAttendance() {
    const { lessonId } = useParams();
    const [attendances, setAttendances] = useState([]);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(attendances.length / rowPerPage);


    const handleGetAttendances = async () => {
        try {
            const response = await appClient.get(`api/attendances/lessons/${lessonId}`);
            const dataRes = await response.data;
            if (dataRes.success) {
                setAttendances(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        handleGetAttendances();
    }, [])

    const handleCreateAttendances = async () => {
        try {
            const response = await appClient.post(`api/Attendances/lessons/${lessonId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Create attendance successfully",
                    duration: 4000
                });

                handleGetAttendances();
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
        if (sortConfig.length === 0) return [...attendances];

        return [...attendances].sort((a, b) => {
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

    const handleReloadAttendance = () => {
        handleGetAttendances();
    }

    const handleAttendAll = async () => {
        try {
            const response = await appClient.put(`api/attendances/lessons/${lessonId}/attended`);
            const dataRes = response.data;

            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Update information successfully",
                    duration: 4000
                });

                handleGetAttendances();
            }
        }
        catch {

        }
    }

    const handleRedirectToHomework = () => {
        navigate("homework")
    }

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [attendances, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.userInfo.firstName + " " + item.userInfo.lastName).toLowerCase();
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
        <div className='w-full h-full flex flex-col px-[20px]'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center'>
                    <div className='mpt__header-item--search-icon'>
                        <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                    </div>
                    <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                </div>

                <div className='flex items-center'>
                    <button className='sab__btn-func !w-fit mr-[20px]' onClick={handleCreateAttendances}>Create</button>
                    {attendances.length != 0 && <button className='sab__btn-func !w-fit  mr-[20px]' onClick={handleAttendAll}>Attend All</button>}
                    <button className='sab__btn-func' onClick={handleRedirectToHomework}>View Homework</button>
                </div>

            </div>
            {attendances.length == 0 &&
                <div className='w-full h-full flex items-center justify-center la__title flex-1'>
                    There is no attendance information for the lesson yet.
                </div>
            }

            {
                attendances.length != 0 &&
                <div className='member-page__tbl mt-[20px]'>
                    <div className="mpt__header flex w-full">
                        <div className="mpt__header-item w-1/3" onClick={(event) => { handleSort("userInfo.email", event) }}>Student Info</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("isAttended", event) }}>Attended</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("isPermitted", event) }}>Permited</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("isLeaved", event) }}>Leaved</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("isLate", event) }}>Lated</div>
                        <div className="mpt__header-item w-1/4"></div>
                    </div>

                    <div className='mpt__body min-h-[390px] mt-[10px]'>
                        {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                            return (
                                <AttendanceItem index={item.index} key={index} attendInfo={item} onReloadAttendances={handleReloadAttendance} />
                            )
                        })}

                        {sortedData.length == 0 &&
                            <div className='w-full h-[390px] flex items-center justify-center'>
                                <span className='er__no-enrolls'>There are no members at this time.</span>
                            </div>
                        }
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
            }
        </div>
    )
}

function AttendanceItem({ attendInfo, index, onReloadAttendances }) {
    const handleAttemp = async () => {
        try {
            const response = await appClient.patch(`api/attendances/${attendInfo.attendId}/attended`, !attendInfo.isAttended, {
                headers: {
                    "Content-Type": 'application/json',
                }
            })

            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Update information successfully",
                    duration: 4000
                });

                onReloadAttendances()
            }
        }
        catch {

        }
    }

    const handleLate = async () => {
        try {
            const response = await appClient.patch(`api/attendances/${attendInfo.attendId}/late`, !attendInfo.isLate, {
                headers: {
                    "Content-Type": 'application/json',
                }
            })

            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Update information successfully",
                    duration: 4000
                });

                onReloadAttendances()
            }
        }
        catch {

        }
    }

    const handlePermit = async () => {
        try {
            const response = await appClient.patch(`api/attendances/${attendInfo.attendId}/permitted`, !attendInfo.isPermitted, {
                headers: {
                    "Content-Type": 'application/json',
                }
            })

            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Update information successfully",
                    duration: 4000
                });

                onReloadAttendances()
            }
        }
        catch {

        }
    }

    const handleLeave = async () => {
        try {
            const response = await appClient.patch(`api/attendances/${attendInfo.attendId}/leaved`, !attendInfo.isLeaved, {
                headers: {
                    "Content-Type": 'application/json',
                }
            })

            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Update information successfully",
                    duration: 4000
                });

                onReloadAttendances()
            }
        }
        catch {
        }
    }

    return (
        <div className={`mpt__row flex items-center mb-[10px]`}>
            <div className="mpt__row-item w-1/3 flex items-center">
                <div>
                    <img src={attendInfo.userInfo.image ? APP_URL + attendInfo.userInfo.image : IMG_URL_BASE + "unknown_user.jpg"} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                </div>

                <div className='flex-1'>
                    <div className='line-clamp-1 cabf__ti--text'>{attendInfo.userInfo.firstName} {attendInfo.userInfo.lastName}</div>
                    <div className='line-clamp-1 cabf__ti--text'>{attendInfo.userInfo.email}</div>
                </div>
            </div>

            <div className="mpt__row-item w-1/12">{attendInfo.isAttended ? "Yes" : "No"}</div>
            <div className="mpt__row-item w-1/12">{attendInfo.isPermitted ? "Yes" : "No"}</div>
            <div className="mpt__row-item w-1/12">{attendInfo.isLeaved ? "Yes" : "No"}</div>
            <div className="mpt__row-item w-1/12">{attendInfo.isLate ? "Yes" : "No"}</div>
            <div className="mpt__row-item w-1/3 flex justify-between items-center !p-0" onClick={(e) => e.stopPropagation()}>
                <button className='ai__btn-func flex-1 ml-[5px]' onClick={handleAttemp}>Attend</button>
                <button className='ai__btn-func flex-1 ml-[5px]' onClick={handleLate}>Late</button>
                <button className='ai__btn-func flex-1 ml-[5px]' onClick={handlePermit}>Permit</button>
                <button className='ai__btn-func flex-1 ml-[5px]' onClick={handleLeave}>Leave</button>
            </div>

        </div>
    )
}

export default LessonAttendance