import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { QuestionItem } from '../../AdminComponent/Course/CourseMainDetail/CourseExamination';

function CourseContentExam() {
    const [isShowAddBoard, setIsShowAddBoard] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [examinationInfo, setExaminationInfo] = useState(null);
    const { contentId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 9;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(questions.length / rowPerPage);

    const getExaminationInfo = async () => {
        try {
            const response = await appClient.get(`api/Examinations/contents/${contentId}`);
            const data = response.data;
            if (data.success) {
                setExaminationInfo(data.message);
            }
        }
        catch {

        }
    }

    const getQuestionInfo = async (toeicId) => {
        try {
            const response = await appClient.get(`api/QuesToeic/toeic/${toeicId}/result`);
            const data = response.data;
            if (data.success) {
                setQuestions(data.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getExaminationInfo();
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

    const handleDeteteUser = (enrollId) => {
        const newEnrolls = enrollInfos.filter(e => e.enrollId != enrollId);
        newEnrolls.map((item, index) => ({ ...item, index: index + 1 }));
        setEnrollInfos(newEnrolls);
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
        if (sortConfig.length === 0) return [...questions];

        return [...questions].sort((a, b) => {
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
    }, [questions, sortConfig])


    useEffect(() => {
        if (examinationInfo != null) {
            getQuestionInfo(examinationInfo.toeicId);
        }
    }, [examinationInfo])

    const handleReloadInfo = () => {
        getExaminationInfo();
    }
    return (
        <div className='cep__wrapper px-[20px] mt-[20px]'>
            <div className='flex justify-end '>
                {examinationInfo == null && <button className='cmp__add-class--btn mb-[20px]' onClick={(e) => setIsShowAddBoard(!isShowAddBoard)}>
                    {
                        isShowAddBoard ?
                            "Hide Board"
                            :
                            "Add Exam"
                    }
                </button>}
            </div>

            {isShowAddBoard && <CourseExaminationAddBoard isShow={isShowAddBoard} onShow={setIsShowAddBoard} onReloadInfo={handleReloadInfo} />}

            <div className='member-page__tbl '>
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("index", event) }}>Question</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("part", event) }}>Part</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("level", event) }}>Level</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("isGroup", event) }}>Group</div>
                </div>

                <div className='mpt__body min-h-[446px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <QuestionItem quesInfo={item} index={item.index} key={index} />
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
        </div>
    )
}

export default CourseContentExam