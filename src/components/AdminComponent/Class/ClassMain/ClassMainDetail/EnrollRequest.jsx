import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';

function EnrollRequest() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [pendingEnrolls, setPendingEnrolls] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(pendingEnrolls.length / rowPerPage);

    const getPendingEnroll = async () => {
        try {
            const response = await appClient.get(`api/Enrolls/class/${classId}/status?statusId=${1}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setPendingEnrolls(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
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

    const handleDeleteEnroll = (enrollId) => {
        let newEnrolls = pendingEnrolls.filter(e => e.enrollId != enrollId);
        newEnrolls = newEnrolls.map((item,index) => ({...item,index: index + 1}));
        setPendingEnrolls(newEnrolls);
    }

    useEffect(() => {
        if (classId == null) {
            navigate("admin")
            return;
        }

        getPendingEnroll();
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
        if (sortConfig.length === 0) return [...pendingEnrolls];

        return [...pendingEnrolls].sort((a, b) => {
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
    }, [pendingEnrolls, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.student.firstName + " " + item.student.lastName).toLowerCase();
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
        <div className='er__wrapper'>
            <div className="flex justify-end items-center mb-[20px]">
                <div className='mpt__header-item--search-icon'>
                    <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                </div>
                <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
            </div>

            <div className='er__tbl__wrapper px-[20px]'>
                <div className='mpt__header flex w-full'>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => handleSort("student.email", event)}>Student Info</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("enrollDate", event)}>Date</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("enrollStatus", event)}>Status</div>
                    <div className="mpt__header-item w-1/4"></div>
                </div>

                <div className='mpt__body min-h-[390px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <EnrollItem enrollInfo={item} key={index} index={item.index} onDeleteItem={handleDeleteEnroll} />
                        )
                    })}

                    {sortedData.length == 0 &&
                        <div className='w-full h-[390px] flex items-center justify-center'>
                            <span className='er__no-enrolls'>There are no request enrollments at this time.</span>
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

function EnrollItem({ enrollInfo, index, onDeleteItem }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);

        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    const handleAcceptEnroll = async () => {
        const response = await appClient.put(`api/enrolls/${enrollInfo.enrollId}/accept`)
        const dataRes = response.data;
        if (dataRes.success) {
            toast({
                type: "success",
                title: "Successfully",
                message: "Enrollment has been accepted successfully",
                duration: 4000
            });

            onDeleteItem(enrollInfo.enrollId);
        }
    }

    const handleRejectEnroll = async () => {
        const response = await appClient.put(`api/enrolls/${enrollInfo.enrollId}/reject`)
        const dataRes = response.data;
        if (dataRes.success) {
            toast({
                type: "success",
                title: "Successfully",
                message: "Enrollment has been rejected successfully",
                duration: 4000
            });

            onDeleteItem(enrollInfo.enrollId);
        }
    }


    return (
        <div className='mpt__row flex items-center mb-[10px]'>
            <div className="mpt__row-item w-1/12 "># {index}</div>
            <div className="mpt__row-item w-1/3 flex items-center">
                <div>
                    <img src={enrollInfo?.studentBackground?.image ? APP_URL + enrollInfo.studentBackground?.image : IMG_URL_BASE + "unknown_user.jpg"} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                </div>
                <div className='flex-1'>
                    <div className='line-clamp-1 cabf__ti--text'>{enrollInfo.student.firstName} {enrollInfo.student.lastName}</div>
                    <div className='line-clamp-1 cabf__ti--text'>{enrollInfo.student.email}</div>
                </div>
            </div>
            <div className="mpt__row-item w-1/4 ">{formatDate(enrollInfo.updateTime)}</div>
            <div className="mpt__row-item w-1/12 eri__status">
                {enrollInfo.enrollStatus}
            </div>
            <div className="mpt__row-item w-1/4 flex items-center justify-end">
                <button className='eri__btn accept mr-[10px]' onClick={handleAcceptEnroll}>Accept</button>
                <button className='eri__btn reject' onClick={handleRejectEnroll}>Reject</button>
            </div>
        </div>
    )
}

export default EnrollRequest