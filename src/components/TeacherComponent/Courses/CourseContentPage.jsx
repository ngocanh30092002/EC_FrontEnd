import React, { useEffect, useState } from 'react'
import { IMG_URL_BASE } from '../../../../GlobalConstant';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { CouresContentItem } from '../../AdminComponent/Course/CourseMainDetail/CouresContentPage';
import CourseContentAssignment from './CourseContentAssignment';
import CourseContentExam from './CourseContentExam';

function CourseContentPage() {
    return (
        <Routes>
            <Route path='/' element={<CourseContentList />} />
            <Route path=':contentId/assignment' element={<CourseContentAssignment/>} />
            <Route path=':contentId/examination' element={<CourseContentExam/>} />
        </Routes>
    )
}

function CourseContentList() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [courseContents, setCourseContents] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(courseContents.length / rowPerPage);

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

    const getCourseContents = async () => {
        try {
            const response = await appClient.get(`api/CourseContent/course/${courseId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setCourseContents(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    const handleDeleteContent = (contentId) => {
        let newCourseContent = courseContents.filter(c => c.contentId != contentId);
        newCourseContent = newCourseContent.map((item, index) => ({ ...item, index: index + 1 }));
        setCourseContents(newCourseContent);
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

    const removeVietnameseAccents = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }


    const getValueByPath = (object, path) => {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
    };

    const sortedDataFunc = () => {
        if (sortConfig.length === 0) return [...courseContents];

        return [...courseContents].sort((a, b) => {
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
        if (courseId == null) {
            navigate(-1);
            return;
        }

        getCourseContents();
    }, [])

    console.log(courseContents)


    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [courseContents, sortConfig])

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
    }, [searchValue])

    return (
        <div className='ccp__wrapper px-[20px] mt-[10px]'>
            <div className='flex justify-between items-center'>
                <div className='cmp__title'>List of Contents</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search !mr-0' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="clb__tbl__wrapper mt-[20px]">
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("noNum", event)}>No</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => handleSort("title", event)}>Title</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => handleSort("content", event)}>Main Content</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("type", event)}>Type</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[330px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <CouresContentItem
                                courseContentInfo={item}
                                key={index}
                                index={item.index}
                                onDeleteCourseContent={handleDeleteContent}
                                isTeacher={true}
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
    )
}

export default CourseContentPage