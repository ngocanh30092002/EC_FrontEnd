import React, { useEffect, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';
import { useNavigate } from 'react-router-dom';
import { CreateRandom } from '@/helper/RandomHelper';

function ToeicHistory({ onShowHistory }) {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const totalPage = Math.ceil(history.length / itemsPerPage)
    const currentHistory = history.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        const getHistoryRecords = () => {
            appClient.get("api/ToeicAttempts")
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setHistory(data.message);
                    }
                })
        }

        getHistoryRecords();

    }, [])

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleCloseHis = () => {
        onShowHistory(false);
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${hours}:${minutes} ${day}-${month}-${year}`;
    }

    const handleViewResult = (item) => {
        const sessionId = CreateRandom();
        sessionStorage.setItem(sessionId, item.toeicId);

        navigate(`/examination?id=${sessionId}&attemptId=${item.attemptId}&type=2`)
    }
    return (
        <div className='fixed toeic-history__wrapper w-full h-full z-[1000] top-0 left-0' onClick={handleCloseHis}>
            <div
                className='absolute top-[50%] px-[30px] py-[20px] left-[50%] translate-x-[-40%] translate-y-[-50%] z-[90] w-[800px] bg-gray-50 border rounded-[8px]'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='th__title'>
                    History Records
                </div>

                <div>
                    <div className='flex w-full th__header--wrapper bg-blue-500'>
                        <div className='w-[30px] th__header-item'>#</div>
                        <div className='w-1/4 th__header-item'>Toeic</div>
                        <div className='w-1/4 th__header-item'>Listening</div>
                        <div className='w-1/4 th__header-item'>Reading</div>
                        <div className='w-1/4 th__header-item'>Date</div>
                    </div>

                    <div className='th__body--wrapper w-full min-h-[255px]'>
                        {currentHistory.map((item, index) => {
                            return (
                                <div className='th__body-row w-full flex' key={index} onClick={(e) => handleViewResult(item)}>
                                    <div className='w-[30px] th__item'>{index + 1 + itemsPerPage * (currentPage - 1)}</div>
                                    <div className='w-1/4 th__item'>{item.toeicExam.name}</div>
                                    <div className='w-1/4 th__item'>{item.listening_Score}</div>
                                    <div className='w-1/4 th__item'>{item.reading_Score}</div>
                                    <div className='w-1/4 th__item'>{formatDate(item.date)}</div>
                                </div>
                            )
                        })}
                    </div>

                    <div className='flex justify-between items-center'>
                        <div className='flex items-center'>
                            <button
                                className='th__item-btn mr-[10px]'
                                onClick={handlePreviousPage}
                            >
                                <img src={IMG_URL_BASE + "left-arrow-icon.svg"} className='w-[20px]' />
                            </button>
                            <button
                                className='th__item-btn'
                                onClick={handleNextPage}>
                                <img src={IMG_URL_BASE + "right-arrow-icon.svg"} className='w-[20px]' />
                            </button>
                        </div>

                        <button className='th__item-close-btn' onClick={(e) => onShowHistory(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ToeicHistory