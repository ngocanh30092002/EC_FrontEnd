import React, { useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';
import RoadmapDetailInfo from './RoadmapDetailInfo';

function RoadMapPage() {
    return (
        <Routes>
            <Route path={"/"} element={<RoadmapListBoard />} />
            <Route path={"/:roadmapId/detail/*"} element={<RoadmapDetailInfo />} />
        </Routes>
    )
}

function RoadmapListBoard() {
    const [roadTrips, setRoadTrips] = useState([]);
    const { courseId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [isShowJourney, setIsShowJourney] = useState(false);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(roadTrips.length / rowPerPage);

    const getRoadTrips = async () => {
        try {
            const response = await appClient.get(`api/RoadMaps/courses/${courseId}`);
            const data = response.data;
            if (data.success) {
                setRoadTrips(data.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getRoadTrips();
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

    const handleDeleteRoadmap = (id) => {
        let newRoadTrips = roadTrips.filter(e => e.roadMapId != id);
        newRoadTrips = newRoadTrips = newRoadTrips.map((item, index) => ({ ...item, index: index + 1 }));
        setRoadTrips(newRoadTrips);
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
        if (sortConfig.length === 0) return [...roadTrips];

        return [...roadTrips].sort((a, b) => {
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
    }, [roadTrips, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.name).toLowerCase();
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

    const handReloadRoadTrip = () => {
        getRoadTrips();
    }

    return (
        <div className='mc__wrapper px-[20px]'>
            <div className="flex justify-between items-center mb-[20px]">
                <div className='rmp__title'>List of journeys</div>
                <div className='flex items-center'>
                    <div className='flex items-center'>
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    <button className='cmp__add-class--btn' onClick={(e) => setIsShowJourney(!isShowJourney)}>
                        {
                            !isShowJourney ?
                                "Add Journeys"
                                :
                                "Hide Board"
                        }
                    </button>
                </div>
            </div>

            {isShowJourney && <RoadmapAddBoard isShow={isShowJourney} courseId={courseId} onShow={setIsShowJourney} onReloadInfo={handReloadRoadTrip} />}

            <div className='member-page__tbl'>
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/6" onClick={(event) => { handleSort("index", event) }}>No</div>
                    <div className="mpt__header-item w-3/4" onClick={(event) => { handleSort("name", event) }}>Roadmap Info</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[390px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <RoadmapItem dataInfo={item} index={item.index} key={index} onDeleteRoadmap={handleDeleteRoadmap} />
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

function RoadmapAddBoard({ isShow, onShow, onReloadInfo, courseId }) {
    const inputNameRef = useRef();
    const inputOrderRef = useRef();

    const handleSubmitForm = async (event) => {
        event.preventDefault();

        try {
            if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Name is required",
                    duration: 4000
                })

                inputNameRef.current.classList.toggle("cabf__input--error");
                inputNameRef.current.focus();

                setTimeout(() => {
                    inputNameRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            let formData = new FormData(event.target);
            if (inputNameRef.current && inputOrderRef.current.value !== "") {
                formData.append("Order", parseInt(inputOrderRef.current.value));
            }

            let response = await appClient.post("api/roadmaps", formData);
            let dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create journey successfully",
                    duration: 4000
                });

                onShow(false);
                onReloadInfo();
            }

        }
        catch {

        }
    }

    const handleChangeOrder = (event) => {
        if (inputOrderRef.current) {
            inputOrderRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    return (
        <form onSubmit={handleSubmitForm} className={`w-full mb-[20px] cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <div className='flex items-center'>
                <div className='flex items-center overflow-visible flex-1'>
                    <div className='ceab__title-text'>Name</div>
                    <input className='ceab__input' name='Name' ref={inputNameRef} />
                    <input className='hidden' name='CourseId' value={courseId} readOnly />
                </div>

                <div className='flex items-center overflow-visible flex-1 ml-[20px]'>
                    <div className='ceab__title-text'>Order</div>
                    <input className='ceab__input' ref={inputOrderRef} onChange={handleChangeOrder} />
                </div>
            </div>

            <div className="flex justify-end mt-[20px]">
                <button className='qi__btn-func !w-[200px]' type='submit'>Submit</button>
            </div>

        </form>
    )
}

function RoadmapItem({ index, dataInfo, onDeleteRoadmap }) {
    const navigate = useNavigate();

    const handleRemoveClick = async () => {
        const confirmAnswer = confirm("Are you sure you want to delete this?");
        if (!confirmAnswer) return;

        const response = await appClient.delete(`api/Roadmaps/${dataInfo.roadMapId}`);
        const dataRes = response.data;
        if (dataRes.success) {
            toast({
                type: "success",
                title: "Successfully",
                message: "Delete user successfully",
                duration: 4000
            });
            onDeleteRoadmap(dataInfo.roadMapId);
        }
    }

    const handleViewRoadMap = () => {
        navigate(`${dataInfo.roadMapId}/detail`);
    }

    return (
        <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleViewRoadMap}>
            <div className="mpt__row-item w-1/6 ">#{index}</div>
            <div className="mpt__row-item w-3/4">{dataInfo.name}</div>
            <div className="mpt__row-item w-1/12" onClick={(e) => e.stopPropagation()}>
                <button className='mpt__item--btn' onClick={handleRemoveClick}>
                    <img src={IMG_URL_BASE + "close.svg"} className='w-[30px] p-[6px]' />
                </button>
            </div>
        </div>
    )
}
export default RoadMapPage