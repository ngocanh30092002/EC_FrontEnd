import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';
import { CreateRandom } from '@/helper/RandomHelper';

function ProcessPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [processes, setProcesses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 5;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(processes.length / rowPerPage);

    const getProcessInfo = async () => {
        try {
            const response = await appClient.get(`api/LearningProcesses/classes/${classId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setProcesses(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }
    useEffect(() => {
        if (classId == null) {
            navigate(-1);
            return;
        }
        getProcessInfo();
    }, [])

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

    const handleDeteteProcess = (id) => {
        let newProcesses = processes.filter(e => e.processID != id);
        newProcesses = newProcesses.map((item, index) => ({ ...item, index: index + 1 }));
        setProcesses(newProcesses);
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
        if (sortConfig.length === 0) return [...processes];

        return [...processes].sort((a, b) => {
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
    }, [processes, sortConfig])

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
        <div className='pp__wrapper px-[20px]'>
            <div className="flex justify-end items-center mb-[20px]">
                <div className='mpt__header-item--search-icon'>
                    <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                </div>
                <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
            </div>

            <div className='member-page__tbl'>
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("userInfo.email", event) }}>User Info</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("assignmentInfo.title", event) }}>Title</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => { handleSort("status", event) }}>Status</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("correctNumber", event) }}>Answer</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("currentRate", event) }}>Rate</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("time", event) }}>Time</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[350px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <ProcessItem processInfo={item} index={item.index} onDelete={handleDeteteProcess} key={index}/>
                        )
                    })}

                    {sortedData.length == 0 &&
                        <div className='w-full h-[390px] flex items-center justify-center'>
                            <span className='er__no-enrolls'>There are no processes at this time.</span>
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
        </div>
    )
}

function ProcessItem({ index, processInfo, onDelete }) {
    const navigate = useNavigate();

    const handleViewAnswer = () => {
        if (processInfo.assignmentInfo !== null) {
            const sessionId = CreateRandom();
            sessionStorage.setItem(sessionId, processInfo.processID);

            navigate(`/assignment/prepare?id=${sessionId}`)
        }
        else {
            const sessionId = CreateRandom();
            sessionStorage.setItem(sessionId, processInfo.processID);
            
            navigate(`/exam?mode=view-result&id=${sessionId}`)
        }
    }
    const handleClickRemove = async () => {
        try {
            var confirmAnswer = confirm("Do you want to delete this process ?");
            if (!confirmAnswer) return;

            let response = await appClient.delete(`api/LearningProcesses/${processInfo.processID}`);
            let data = response.data;
            if (data.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Delete process successfully",
                    duration: 4000
                });

                onDelete(processInfo.processID);
            }
        }
        catch {

        }
    }
    return (
        <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleViewAnswer}>
            <div className="mpt__row-item w-1/4 flex items-center">
                <div className=''>
                    <img src={processInfo?.userInfo?.image == null ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + processInfo.userInfo.image} className='w-[40px] object-cover h-[40px] rounded-[10px]' />
                </div>
                <div className='ml-[10px] flex-1'>
                    <div className='pi__title-value line-clamp-1'>{processInfo.userInfo.firstName} {processInfo.userInfo.lastName}</div>
                    <div className='pi__title-value line-clamp-1'>{processInfo.userInfo.email}</div>
                </div>
            </div>
            <div className="mpt__row-item w-1/4 !text-[12px]">
                {
                    processInfo.assignmentInfo != null ?
                        processInfo.assignmentInfo.title
                        :
                        processInfo.examInfo.title
                }
            </div>
            <div className="mpt__row-item w-1/6 !text-[12px]">{processInfo.status}</div>
            <div className="mpt__row-item w-1/12">{processInfo.correctNumber}/{processInfo.totalNumber}</div>
            <div className="mpt__row-item w-1/12">{processInfo.currentRate}%</div>
            <div className="mpt__row-item w-1/12">{processInfo.time}</div>
            <div className="mpt__row-item w-1/12 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClickRemove}>
                    <img src={IMG_URL_BASE + "close.svg"} className='w-[20px]' />
                </button>
            </div>
        </div>
    )
}
export default ProcessPage