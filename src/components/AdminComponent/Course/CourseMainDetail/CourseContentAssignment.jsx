import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import MaskedInput from 'react-text-mask';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import DropDownList from '../../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';
import { QuestionInfo } from '../../Class/ClassMain/ClassMainDetail/LessonHomework';
import LoaderPage from '../../../LoaderComponent/LoaderPage';

function CourseContentAssignment() {
    const { contentId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(assignments.length / rowPerPage);

    const getAssignment = async () => {
        try {
            const response = await appClient.get(`api/Assignments/content/${contentId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setAssignments(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
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

    const handleDeleteAssignment = (id) => {
        let newAssignments = assignments.filter(c => c.assignmentId != id);
        newAssignments = newAssignments.map((item, index) => ({ ...item, index: index + 1 }));
        setAssignments(newAssignments);
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
        if (sortConfig.length === 0) return [...assignments];

        return [...assignments].sort((a, b) => {
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
        getAssignment();
    }, [])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [assignments, sortConfig])

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

    const handleReloadAssignment = () => {
        getAssignment();
    }

    return (
        <div className='ccp__wrapper px-[20px]'>
            <div className='flex justify-between items-center'>
                <div className='cmp__title'>List of Assignments</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    <button className='cmp__add-class--btn' onClick={(e) => setIsShowBoard(!isShowBoard)}>
                        {
                            !isShowBoard ?
                                "Add Assignment"
                                :
                                "Hide Board"
                        }
                    </button>
                </div>
            </div>

            <AddAssignmentBoard isShow={isShowBoard} onShow={setIsShowBoard} contentId={contentId} onReloadAssignment={handleReloadAssignment} />

            <div className="clb__tbl__wrapper mt-[20px]">
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("noNum", event)}>No</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("title", event)}>Title</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("time", event)}>Time</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("achieved_Percentage", event)}>Pass Rate</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("canViewResult", event)}>Allow View</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[390px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <ContentAssignmentItem
                                assignmentInfo={item}
                                key={index}
                                index={item.index}
                                onDeleteAssignment={handleDeleteAssignment}
                                onReloadAssignment={handleReloadAssignment}
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

function AddAssignmentBoard({ isShow, onShow, contentId, onReloadAssignment }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedQues, setSelectedQues] = useState(() => {
        return Array.from({ length: 7 }).reduce((acc, _, i) => {
            acc[i + 1] = [];
            return acc;
        }, {});
    });
    const [selectedMode, setSelectedModel] = useState(0);
    const [selectedAllowView, setSelectedAllowView] = useState(0);
    const [queType, setQueTypes] = useState([]);
    const [defaultType, setDefaultType] = useState(-1);
    const [defaultQues, setDefaultQues] = useState(-1);
    const [selectedQuesId, setSelectedQuesId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [listQues, setListQues] = useState([]);

    const inputTimeRef = useRef(null);
    const inputExpectedTimeRef = useRef(null);
    const inputTitleRef = useRef(null);
    const inputPassRef = useRef(null);
    const inputNoNumRef = useRef(null);
    const queRandomRef = useRef(null);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const timeToSeconds = (time) => {
        let [hours, minutes, seconds] = time.split(':').map(Number);
        return Math.round(hours * 3600 + minutes * 60 + seconds);
    }

    const secondsToTime = (totalSeconds) => {
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const isValidTime = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (
            hours >= 0 && hours <= 23 &&
            minutes >= 0 && minutes <= 59 &&
            seconds >= 0 && seconds <= 59
        );
    };

    const getQuesTypes = async () => {
        try {
            const response = await appClient.get("api/HomeQues/types");
            const dataRes = response.data;
            if (dataRes.success) {
                setQueTypes(dataRes.message);
            }
        }
        catch {

        }
    }

    const handleSelectedQuesType = (item, index) => {
        if (item) {
            setSelectedType(item.value);
        }
        else {
            setSelectedType(null);
        }

        setDefaultType(index);
        setDefaultQues(-1);
        setSelectedQuesId(null);
    }

    const handleSelectQuesId = (item, index) => {
        if (item) {
            setSelectedQuesId(item.value)
        }
        else {
            setSelectedQuesId(null);
        }

        setDefaultQues(index);
    }

    const getListQuestions = async () => {
        try {
            let apiQuestions = undefined;

            switch (selectedType) {
                case 1:
                    apiQuestions = "api/lc-images";
                    break;
                case 2:
                    apiQuestions = "api/lc-audios";
                    break;
                case 3:
                    apiQuestions = "api/lc-con";
                    break;
                case 4:
                    apiQuestions = "api/rc-sentence"
                    break;
                case 5:
                    apiQuestions = "api/rc-single"
                    break;
                case 6:
                    apiQuestions = "api/rc-double"
                    break;
                case 7:
                    apiQuestions = "api/rc-triple"
                    break;
            }

            const response = await appClient.get(apiQuestions);
            const dataRes = response.data;

            if (dataRes.success) {
                setListQues(dataRes.message);
            }
        }
        catch {

        }
    }

    const handleDeleteQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuesId != null) {
                const length = prev[selectedType] ? prev[selectedType].length : 0;

                if (prev[selectedType]) {
                    prev[selectedType] = prev[selectedType].filter(i => i !== selectedQuesId);
                }

                const lengthAfter = prev[selectedType] ? prev[selectedType].length : 0;

                if (length !== lengthAfter) {
                    if (inputExpectedTimeRef.current) {
                        const selectedQues = listQues.find(i => i.id == selectedQuesId);
                        const inputValue = inputExpectedTimeRef.current.value;
                        let totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) - timeToSeconds(selectedQues.time);

                        inputExpectedTimeRef.current.value = secondsToTime(totalTime < 0 ? 0 : totalTime);
                    }
                }

            }
            return { ...prev }
        });
    }

    const handleAddQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuesId != null) {
                const length = prev[selectedType] ? prev[selectedType].length : 0;
                if (prev[selectedType]) {
                    prev[selectedType] = prev[selectedType].filter(i => i !== selectedQuesId);
                    prev[selectedType].push(selectedQuesId);
                }
                else {
                    prev[selectedType] = [selectedQuesId];
                }

                const lengthAfter = prev[selectedType] ? prev[selectedType].length : 0;

                if (length !== lengthAfter) {
                    if (inputExpectedTimeRef.current) {
                        const selectedQues = listQues.find(i => i.id == selectedQuesId);
                        const inputValue = inputExpectedTimeRef.current.value;
                        const totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) + timeToSeconds(selectedQues.time);
                        inputExpectedTimeRef.current.value = secondsToTime(totalTime);
                    }
                }
            }
            return { ...prev }
        });
    }

    const handleClearInput = () => {

        setSelectedQues(() => {
            return Array.from({ length: 7 }).reduce((acc, _, i) => {
                acc[i + 1] = [];
                return acc;
            }, {});
        })
        inputTitleRef.current.value = "";
        inputPassRef.current.value = "";
        inputNoNumRef.current.value = "";
        setSelectedModel(0);
        setSelectedAllowView(0);

        if (inputExpectedTimeRef?.current) {
            inputExpectedTimeRef.current.value = "";
        }
        if (inputTimeRef?.current) {
            inputTimeRef.current.inputElement.value = "";
        }

        setDefaultType(-1);
        setDefaultQues(-1);
    }

    const handleChangeNoNum = (event) => {
        if (inputNoNumRef.current) {
            inputNoNumRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleChangePassRate = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        const numericValue = parseInt(value, 10);

        if (numericValue >= 0 && numericValue <= 100) {
            if (inputPassRef.current) {
                inputPassRef.current.value = numericValue;
            }
        } else {
            if (inputPassRef.current) {
                inputPassRef.current.value = '';
            }
        }
    }

    const handleSubmitForm = async (event) => {
        event.preventDefault();

        try {
            if (inputTitleRef.current && (inputTitleRef.current.value == "" || inputTitleRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Title is required",
                    duration: 4000
                })

                inputTitleRef.current.classList.toggle("cabf__input--error");
                inputTitleRef.current.focus();

                setTimeout(() => {
                    inputTitleRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            if (inputPassRef.current && (inputPassRef.current.value == "" || inputPassRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Pass rate is required",
                    duration: 4000
                })

                inputPassRef.current.classList.toggle("cabf__input--error");
                inputPassRef.current.focus();

                setTimeout(() => {
                    inputPassRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            if (selectedMode == 0) {
                let inputTime = inputTimeRef.current.inputElement;
                if (inputTime && (inputTime.value == "" || inputTime.value == null)) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Time is required",
                        duration: 4000
                    })

                    inputTime.classList.toggle("cabf__input--error");
                    inputTime.focus();

                    setTimeout(() => {
                        inputTime.classList.toggle("cabf__input--error");
                    }, 2000);

                    return;
                }
                else {
                    let isValid = isValidTime(inputTime.value);
                    let seconds = timeToSeconds(inputTime.value);
                    if (isValid == false || seconds == 0) {
                        toast({
                            type: "error",
                            title: "ERROR",
                            message: "Time is invalid",
                            duration: 4000
                        })

                        inputTime.classList.toggle("cabf__input--error");
                        inputTime.focus();

                        setTimeout(() => {
                            inputTime.classList.toggle("cabf__input--error");
                        }, 2000);
                        return;
                    }
                }
            }

            setIsLoading(true);
            const formData = new FormData(event.target);

            if (inputNoNumRef.current && inputNoNumRef.current.value != "") {
                formData.append("NoNum", parseInt(inputNoNumRef.current.value));
            }

            let response = await appClient.post("api/assignments", formData);
            let dataRes = response.data;
            if (dataRes.success && selectedMode == 0) {
                const assignmentId = dataRes.message;
                const formDataAssignQues = new FormData();

                let indexNum = 0;
                Object.keys(selectedQues).forEach((key, index) => {
                    selectedQues[key].forEach((item, indexQue) => {
                        formDataAssignQues.append(`typeModels[${indexNum}].Type`, key);
                        formDataAssignQues.append(`typeModels[${indexNum}].AssignmentId`, assignmentId);
                        formDataAssignQues.append(`typeModels[${indexNum}].QuesId`, item);
                        indexNum++;
                    })
                })

                response = await appClient.post(`api/AssignQues/assignments/${assignmentId}`, formDataAssignQues);
                dataRes = response.data;
                if (dataRes.success) {
                    onShow(false);
                    handleClearInput();
                    onReloadAssignment();

                    toast({
                        type: "success",
                        title: "Success",
                        message: "Create assignment successfully",
                        duration: 4000
                    });
                }
            }

            if (dataRes.success && selectedMode == 1) {
                const assignmentId = dataRes.message;
                const quesDataForm = queRandomRef.current.getFormData();

                response = await appClient.post(`api/AssignQues/assignments/${assignmentId}/random`, quesDataForm);
                dataRes = response.data;
                if (dataRes.success) {
                    onShow(false);
                    handleClearInput();
                    onReloadAssignment();

                    toast({
                        type: "success",
                        title: "Success",
                        message: "Create assignment successfully",
                        duration: 4000
                    });
                }
            }

            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            console.log(err);
        }
    }

    useEffect(() => {
        getQuesTypes();
    }, [])


    useEffect(() => {
        if (selectedType != null) {
            getListQuestions();
        }
    }, [selectedType])

    return (
        <>
            {isLoading && <LoaderPage />}
            <form onSubmit={handleSubmitForm} className={`w-full min-h-[300px] mt-[20px] flex flex-col cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
                <div className="flex items-center mt-[20px]">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Title</div>
                        <input
                            name='Title'
                            className='cab__input-text'
                            ref={inputTitleRef}
                        />

                        <input name='ContentId' value={contentId} readOnly className='hidden' />
                    </div>
                </div>

                <div className="flex items-center mt-[20px]">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Pass Rate</div>
                        <input
                            name='Achieved_Percentage'
                            className='cab__input-text'
                            ref={inputPassRef}
                            onChange={handleChangePassRate}
                        />
                    </div>
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>No Num</div>
                        <input
                            className='cab__input-text'
                            ref={inputNoNumRef}
                            onChange={handleChangeNoNum}
                        />
                    </div>
                </div>

                <div className='flex items-center mt-[20px]'>
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Mode</div>

                        <div className='flex items-center justify-around flex-1'>
                            <div className='flex items-center'>
                                <input type='radio' name='ques-type' id='select' checked={selectedMode == 0} onChange={(e) => setSelectedModel(0)} />
                                <label className='aab__title-lbl' htmlFor='select'>Select</label>
                            </div>

                            <div className='flex items-center'>
                                <input type='radio' name='ques-type' id='random' checked={selectedMode == 1} onChange={(e) => setSelectedModel(1)} />
                                <label className='aab__title-lbl' htmlFor='random'>Random</label>
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Allow View</div>

                        <div className='flex items-center justify-around flex-1'>
                            <div className='flex items-center'>
                                <input type='radio' name='CanViewResult' value={false} id='allow-view-yes' checked={selectedAllowView == 0} onChange={(e) => setSelectedAllowView(0)} />
                                <label className='aab__title-lbl' htmlFor='allow-view-yes'>Yes</label>
                            </div>

                            <div className='flex items-center'>
                                <input type='radio' name='CanViewResult' value={true} id='allow-view-no' checked={selectedAllowView == 1} onChange={(e) => setSelectedAllowView(1)} />
                                <label className='aab__title-lbl' htmlFor='allow-view-no'>No</label>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    selectedMode == 0 &&
                    <>
                        <div className="flex items-center mt-[20px]">
                            <div className="flex items-center flex-1">
                                <div className='cab__title--text'>Expected Time</div>
                                <input
                                    type='text'
                                    className="lbh__input"
                                    readOnly
                                    ref={inputExpectedTimeRef}
                                />
                            </div>
                            <div className="flex items-center flex-1">
                                <div className='cab__title--text'>Time</div>
                                <MaskedInput
                                    name='Time'
                                    mask={timeMask}
                                    placeholder="00:00:00"
                                    defaultValue={"00:00:00"}
                                    className="lbh__input"
                                    ref={inputTimeRef}
                                />
                            </div>
                        </div>

                        <div className="flex items-center mt-[20px] overflow-visible">
                            <div className="flex items-center flex-1 overflow-visible">
                                <div className='cab__title--text'>Question Types</div>
                                <DropDownList data={queType} defaultIndex={defaultType} className={"border !rounded-[20px]"} placeholder={"Select question type..."} onSelectedItem={handleSelectedQuesType} />
                            </div>

                            {selectedType != null ?
                                <div className='flex items-center overflow-visible flex-1'>
                                    <div className="cab__title--text">Question Id </div>
                                    <DropDownList data={listQues.map((item, index) => ({ key: item.id, value: item.id }))} defaultIndex={defaultQues} className={"border !rounded-[20px] pt-0"} placeholder={"Select question id..."} onSelectedItem={handleSelectQuesId} />
                                </div>
                                :
                                <div className='flex-1'></div>
                            }
                        </div>

                        {selectedType != null &&
                            <>
                                <div className='flex items-center justify-between mt-[20px] border'>
                                    {
                                        Object.keys(selectedQues).map((key, index) => {
                                            let typeName = undefined;
                                            if (key == 1) {
                                                typeName = "Image";
                                            }
                                            else if (key == 2) {
                                                typeName = "Audio";
                                            }
                                            else if (key == 3) {
                                                typeName = "Conversation";
                                            }
                                            else if (key == 4) {
                                                typeName = "Sentence";
                                            }
                                            else if (key == 5) {
                                                typeName = "Single";
                                            }
                                            else if (key == 6) {
                                                typeName = "Double";
                                            }
                                            else {
                                                typeName = "Triple"
                                            }

                                            return (
                                                <div className='flex items-center sq__wrapper' key={index}>
                                                    <div className='sq__type-name'>{typeName}:</div>
                                                    <div className='sq__num'>{selectedQues[key].length}</div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                                <div className='flex items-center justify-between mt-[20px] mb-[20px]'>
                                    <div className='flex justify-end '>
                                        <div className='qi__btn-func delete' onClick={(event) => handleDeleteQues(event)}>Undo</div>
                                        <div className='qi__btn-func' onClick={(event) => handleAddQues(event)}>Add</div>
                                    </div>

                                    <div>
                                        {
                                            selectedQues[selectedType].includes(selectedQuesId) &&
                                            <div className='qi__selected--text'>
                                                Selected
                                            </div>
                                        }
                                    </div>

                                    <div>
                                        <button className='qi__btn-func !w-[200px]' type='submit'>Submit</button>
                                    </div>
                                </div>

                                {selectedType != null && selectedQuesId != null &&
                                    <QuestionInfo
                                        listQues={listQues}
                                        quesId={selectedQuesId}
                                        type={selectedType}
                                    />
                                }
                            </>
                        }
                    </>
                }

                {
                    selectedMode == 1 &&
                    <div className='mt-[20px]'>
                        <QuestionRandomBoard ref={queRandomRef} />
                        <div className="flex justify-end mt-[20px]">
                            <button type='submit' className='qi__btn-func !w-[200px]'>Submit</button>
                        </div>
                    </div>
                }
            </form>
        </>
    )
}

export const QuestionRandomBoard = forwardRef((props, ref) => {
    const [dataParts, setDataParts] = useState([]);
    const btnRef = useRef(null);
    const formQuesRef = useRef(null);

    const handleBlurInput = (event) => {
        const parentWrapper = event.target.closest('.rdo__row__wrapper');
        const inputs = parentWrapper.querySelectorAll('.rdo__row-input');
        const lastInput = inputs[inputs.length - 1];
        const eventNum = event.target.value == "" ? 0 : parseInt(event.target.value);

        let total = 0;
        inputs.forEach(input => {
            if (input !== event.target && input !== lastInput) {
                total += parseInt(input.value) || 0;
            }
        });

        const remainingValue = lastInput.defaultValue - total;
        if (remainingValue - eventNum < 0) {
            event.target.value = '';
            lastInput.value = remainingValue;
            return;
        }

        lastInput.value = remainingValue - eventNum;
    }

    const handleChangeInput = (event) => {
        event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
    const handleSubmitForm = (event) => {
        if (event) event.preventDefault();
        const formData = new FormData();
        const inputs = formQuesRef.current.querySelectorAll("input");

        inputs.forEach((input, index) => {
            if (input.name) {
                formData.append(input.name, input.value == "" ? 0 : input.value);
            }
        });

        return formData;
    }

    useEffect(() => {
        const getDataParts = async () => {
            try {
                const response = await appClient.get("api/assignques/max-num");
                const dataRes = response.data;
                if (dataRes.success) {
                    setDataParts(dataRes.message);
                }
            }
            catch {

            }
        }

        getDataParts();
    }, [])

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            return handleSubmitForm();
        }
    }))

    return (
        <div className='qts__wrapper'>
            <div className='rdq__tbl' ref={formQuesRef} >
                <div className="rdq__header__wrapper flex">
                    <div className="rdq__header !px-[10px] !border-l-0"></div>
                    <div className="rdq__header !px-[10px] ">Easy</div>
                    <div className="rdq__header !px-[10px]">Intermediate</div>
                    <div className="rdq__header !px-[10px]">Hard</div>
                    <div className="rdq__header !px-[10px]">Very Hard</div>
                    <div className="rdq__header !px-[10px]">Max</div>
                </div>

                <div className="rdo__body">
                    {
                        dataParts.map((item, index) => {
                            return (
                                <div className="rdo__row__wrapper flex w-full" key={index}>
                                    <div className='rdo__row-part-name  flex-1'>
                                        {item.typeName}
                                        <input className='hidden' name={`typeModels[${index}].Type`} readOnly defaultValue={index + 1} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`typeModels[${index}].NumNormal`} onBlur={handleBlurInput} onChange={handleChangeInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`typeModels[${index}].NumIntermediate`} onBlur={handleBlurInput} onChange={handleChangeInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`typeModels[${index}].NumHard`} onBlur={handleBlurInput} onChange={handleChangeInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`typeModels[${index}].NumVeryHard`} onBlur={handleBlurInput} onChange={handleChangeInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' readOnly defaultValue={item.maxNum} />
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                <button type='button' onClick={handleSubmitForm} ref={btnRef} className='hidden'>Click</button>
            </div>
        </div>
    )
})

function ContentAssignmentItem({ index, onDeleteAssignment, assignmentInfo, onReloadAssignment }) {
    const [isShowDetail, setIsShowDetail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleRedirectToAssignment = () => {
        setIsShowDetail(true);
    }

    const handleRemoveClick = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        try {
            setIsLoading(true);
            const confirmAnswer = confirm("Do you want to delete this assignment");
            if (confirmAnswer == false) return;

            const response = await appClient.delete(`api/assignments/${assignmentInfo.assignmentId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Delete assignment successfully",
                    duration: 4000
                });

                onDeleteAssignment(assignmentInfo.assignmentId);
                onReloadAssignment();
            }

            setIsLoading(false);
        }
        catch {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleRedirectToAssignment}>
                <div className="mpt__row-item w-1/12 cci__row-item"># {assignmentInfo?.noNum}</div>
                <div className="mpt__row-item w-1/4 cci__row-item">{assignmentInfo?.title}</div>
                <div className="mpt__row-item w-1/4 cci__row-item">{assignmentInfo?.time}</div>
                <div className="mpt__row-item w-1/6 cci__row-item">{assignmentInfo?.achieved_Percentage}</div>
                <div className="mpt__row-item w-1/6 cci__row-item">{assignmentInfo?.canViewResult == true ? "Yes" : "No"}</div>
                <div className="mpt__row-item w-1/12 cci__row-item" onClick={(e) => e.stopPropagation()}>
                    <button className='mpt__item--btn' onClick={handleRemoveClick}>
                        <img src={IMG_URL_BASE + "close.svg"} className='w-[25px] p-[3px]' />
                    </button>
                </div>
            </div>

            {isShowDetail && <AssignmentDetail onShow={setIsShowDetail} assignmentInfo={assignmentInfo} onReloadAssignment={onReloadAssignment} />}
            {isLoading && <LoaderPage/>}
        </>
    )
}

function AssignmentDetail({ onShow, assignmentInfo, onReloadAssignment }) {
    const [isShowAddBoard, setIsShowAddBoard] = useState(false);
    const [isReload, setIsReload] = useState(false);
    const { contentId } = useParams();
    const [isCanShowResult, setIsCanShowResult] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const inputTitleRef = useRef(null);
    const inputTimeRef = useRef(null);
    const inputPassRef = useRef(null);
    const inputOrderRef = useRef(null);
    const btnSubmitRef = useRef(null);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const timeToSeconds = (time) => {
        let [hours, minutes, seconds] = time.split(':').map(Number);
        return Math.round(hours * 3600 + minutes * 60 + seconds);
    }

    const isValidTime = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (
            hours >= 0 && hours <= 23 &&
            minutes >= 0 && minutes <= 59 &&
            seconds >= 0 && seconds <= 59
        );
    };

    const handleChangeOrder = (event) => {
        if (inputOrderRef.current) {
            inputOrderRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleChangePassRate = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        const numericValue = parseInt(value, 10);

        if (numericValue >= 0 && numericValue <= 100) {
            if (inputPassRef.current) {
                inputPassRef.current.value = numericValue;
            }
        } else {
            if (inputPassRef.current) {
                inputPassRef.current.value = '';
            }
        }
    }

    const handleClickEdit = (event) => {
        event.preventDefault();

        if (!isEditing) {
            setIsEditing(!isEditing);
        }
        else {
            btnSubmitRef.current.click();
        }
    }

    const handleAddQues = (event) => {
        event.preventDefault();
        setIsShowAddBoard(true);
    }

    const handleClickClose = (event) => {
        event.preventDefault();
        onShow(false);
    }

    const handleSubmitAssignment = async (event) => {
        event.preventDefault();
        try {
            if (inputTitleRef.current && (inputTitleRef.current.value == "" || inputTitleRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Title is required",
                    duration: 4000
                })

                inputTitleRef.current.classList.toggle("cabf__input--error");
                inputTitleRef.current.focus();

                setTimeout(() => {
                    inputTitleRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            if (inputPassRef.current && (inputPassRef.current.value == "" || inputPassRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Pass rate is required",
                    duration: 4000
                })

                inputPassRef.current.classList.toggle("cabf__input--error");
                inputPassRef.current.focus();

                setTimeout(() => {
                    inputPassRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            let inputTime = inputTimeRef.current.inputElement;
            if (inputTime && (inputTime.value == "" || inputTime.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Time is required",
                    duration: 4000
                })

                inputTime.classList.toggle("cabf__input--error");
                inputTime.focus();

                setTimeout(() => {
                    inputTime.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }
            else {
                let isValid = isValidTime(inputTime.value);
                let seconds = timeToSeconds(inputTime.value);
                if (isValid == false || seconds == 0) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Time is invalid",
                        duration: 4000
                    })

                    inputTime.classList.toggle("cabf__input--error");
                    inputTime.focus();

                    setTimeout(() => {
                        inputTime.classList.toggle("cabf__input--error");
                    }, 2000);
                    return;
                }
            }

            const formData = new FormData(event.target);
            const response = await appClient.put(`api/Assignments/${assignmentInfo.assignmentId}`, formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Update infomation successfully",
                    duration: 4000
                });

                setIsEditing(!isEditing);
                onReloadAssignment();
                onShow(false);
            }
        }
        catch (err) {
        }
    }

    const handleReloadAssignment = () => {
        onReloadAssignment();
        setIsReload(!isReload);
    }

    useEffect(() => {
        inputTitleRef.current.value = assignmentInfo.title;
        inputTimeRef.current.inputElement.value = assignmentInfo.time;
        inputOrderRef.current.value = assignmentInfo.noNum;
        inputPassRef.current.value = assignmentInfo.achieved_Percentage;
        setIsCanShowResult(assignmentInfo.canViewResult);
    }, [assignmentInfo])

    return (
        <>
            <div className='fixed top-0 left-0 w-full h-full z-[1000] flex items-center justify-center bg-gray-400 bg-opacity-20' onClick={(e) => onShow(false)}>
                <div className='w-[800px] h-[600px] p-[20px] bg-white rounded-[10px] shadow-lg' onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmitAssignment} className='ad__info__wrapper flex flex-col'>
                        <div className='flex justify-between'>
                            <input
                                className={`ad__info--title ${isEditing && "border"}`}
                                name='Title'
                                ref={inputTitleRef}
                                readOnly={!isEditing}
                            />

                            <div className="flex ml-[10px]">
                                <button className='ad__info-btn !p-[0] mr-[10px]' onClick={handleClickEdit}>
                                    {
                                        !isEditing ?
                                            "Edit"
                                            :
                                            "Save"
                                    }
                                </button>
                                <button className='ad__info-btn !p-[0] mr-[10px]' onClick={handleAddQues}>Add</button>
                                <button className='ad__info-btn !p-[0]' onClick={handleClickClose}>Close</button>
                            </div>
                        </div>

                        <input className='hidden' name='ContentId' value={contentId} readOnly />
                        <div className='flex mt-[10px]'>
                            <div className='flex items-center flex-1'>
                                <div className='ad__info--text'>Time: </div>
                                <MaskedInput
                                    name='Time'
                                    mask={timeMask}
                                    placeholder="00:00:00"
                                    defaultValue={"00:00:00"}
                                    className={`ad__info--input ${isEditing && "border"}`}
                                    ref={inputTimeRef}
                                    readOnly={!isEditing}
                                />
                            </div>

                            <div className='flex items-center flex-1'>
                                <div className='ad__info--text'>Pass Rate: </div>
                                <input
                                    ref={inputPassRef}
                                    className={`ad__info--input ${isEditing && "border"}`}
                                    name='Achieved_Percentage'
                                    readOnly={!isEditing}
                                    onChange={handleChangePassRate}
                                />
                            </div>
                        </div>

                        <div className='flex mt-[10px]'>
                            <div className='flex items-center flex-1'>
                                <div className='ad__info--text'>Order: </div>
                                <input
                                    ref={inputOrderRef}
                                    className={`ad__info--input ${isEditing && "border"}`}
                                    name='NoNum'
                                    readOnly={!isEditing}
                                    onChange={handleChangeOrder}
                                />

                            </div>

                            <div className="flex items-center flex-1">
                                <div className='ad__info--text'>Allow View: </div>

                                <div className='flex items-center justify-start flex-1'>
                                    <div className='flex items-center '>
                                        <input type='radio' name='CanViewResult' disabled={!isEditing} value={true} id='allow-view-yes' checked={isCanShowResult == true} onChange={(e) => setIsCanShowResult(true)} />
                                        <label className='aab__title-lbl' htmlFor='allow-view-yes'>Yes</label>
                                    </div>

                                    <div className='flex items-center ml-[90px]'>
                                        <input type='radio' name='CanViewResult' disabled={!isEditing} value={false} id='allow-view-no' checked={isCanShowResult == false} onChange={(e) => setIsCanShowResult(false)} />
                                        <label className='aab__title-lbl' htmlFor='allow-view-no'>No</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type='submit' className='hidden' ref={btnSubmitRef}></button>
                    </form>

                    <div className='ad__info-ques__wrapper'>
                        <AssignmentDetailListQues assignmentId={assignmentInfo.assignmentId} isReload={isReload} />
                    </div>
                </div>
            </div>

            {isShowAddBoard && <AssignmentAddBoard onReloadAssignment={handleReloadAssignment} assignmentInfo={assignmentInfo} isShow={isShowAddBoard} onShow={setIsShowAddBoard} />}
        </>
    )
}

function AssignmentAddBoard({ assignmentInfo, isShow, onShow, onReloadAssignment }) {
    const [isLoading, setIsLoading] = useState(false);
    const [queType, setQueTypes] = useState([]);
    const [defaultType, setDefaultType] = useState(-1);
    const [defaultQues, setDefaultQues] = useState(-1);
    const [selectedQuesId, setSelectedQuesId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedQues, setSelectedQues] = useState(() => {
        return Array.from({ length: 7 }).reduce((acc, _, i) => {
            acc[i + 1] = [];
            return acc;
        }, {});
    });
    const [listQues, setListQues] = useState([]);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
    const inputTimeRef = useRef(null);
    const inputExpectedTimeRef = useRef(null);

    const handleSelectedQuesType = (item, index) => {
        if (item) {
            setSelectedType(item.value);
        }
        else {
            setSelectedType(null);
        }

        setDefaultType(index);
        setDefaultQues(-1);
        setSelectedQuesId(null);
    }

    const handleSelectQuesId = (item, index) => {
        if (item) {
            setSelectedQuesId(item.value)
        }
        else {
            setSelectedQuesId(null);
        }

        setDefaultQues(index);
    }

    const getListQuestions = async () => {
        try {
            let apiQuestions = undefined;

            switch (selectedType) {
                case 1:
                    apiQuestions = `api/lc-images/assignments/${assignmentInfo.assignmentId}/other`;
                    break;
                case 2:
                    apiQuestions = `api/lc-audios/assignments/${assignmentInfo.assignmentId}/other`;
                    break;
                case 3:
                    apiQuestions = `api/lc-con/assignments/${assignmentInfo.assignmentId}/other`;
                    break;
                case 4:
                    apiQuestions = `api/rc-sentence/assignments/${assignmentInfo.assignmentId}/other`;
                    break;
                case 5:
                    apiQuestions = `api/rc-single/assignments/${assignmentInfo.assignmentId}/other`;
                    break;
                case 6:
                    apiQuestions = `api/rc-double/assignments/${assignmentInfo.assignmentId}/other`;
                    break;
                case 7:
                    apiQuestions = `api/rc-triple/assignments/${assignmentInfo.assignmentId}/other`;
                    break;
            }

            const response = await appClient.get(apiQuestions);
            const dataRes = response.data;

            if (dataRes.success) {
                setListQues(dataRes.message);
            }
        }
        catch {

        }
    }

    const timeToSeconds = (time) => {
        let [hours, minutes, seconds] = time.split(':').map(Number);
        return Math.round(hours * 3600 + minutes * 60 + seconds);
    }

    const secondsToTime = (totalSeconds) => {
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const isValidTime = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (
            hours >= 0 && hours <= 23 &&
            minutes >= 0 && minutes <= 59 &&
            seconds >= 0 && seconds <= 59
        );
    };

    const handleDeleteQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuesId != null) {
                const length = prev[selectedType] ? prev[selectedType].length : 0;

                if (prev[selectedType]) {
                    prev[selectedType] = prev[selectedType].filter(i => i !== selectedQuesId);
                }

                const lengthAfter = prev[selectedType] ? prev[selectedType].length : 0;

                if (length !== lengthAfter) {
                    if (inputExpectedTimeRef.current) {
                        const selectedQues = listQues.find(i => i.id == selectedQuesId);
                        const inputValue = inputExpectedTimeRef.current.value;
                        let totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) - timeToSeconds(selectedQues.time);

                        inputExpectedTimeRef.current.value = secondsToTime(totalTime < 0 ? 0 : totalTime);
                    }
                }

            }
            return { ...prev }
        });
    }

    const handleAddQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuesId != null) {
                const length = prev[selectedType] ? prev[selectedType].length : 0;
                if (prev[selectedType]) {
                    prev[selectedType] = prev[selectedType].filter(i => i !== selectedQuesId);
                    prev[selectedType].push(selectedQuesId);
                }
                else {
                    prev[selectedType] = [selectedQuesId];
                }

                const lengthAfter = prev[selectedType] ? prev[selectedType].length : 0;

                if (length !== lengthAfter) {
                    if (inputExpectedTimeRef.current) {
                        const selectedQues = listQues.find(i => i.id == selectedQuesId);
                        const inputValue = inputExpectedTimeRef.current.value;
                        const totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) + timeToSeconds(selectedQues.time);
                        inputExpectedTimeRef.current.value = secondsToTime(totalTime);
                    }
                }
            }
            return { ...prev }
        });
    }

    const getQuesTypes = async () => {
        try {
            const response = await appClient.get("api/HomeQues/types");
            const dataRes = response.data;
            if (dataRes.success) {
                setQueTypes(dataRes.message);
            }
        }
        catch {

        }
    }

    const handleAddMoreQuestion = async (event) => {
        event.preventDefault();
        let inputTime = inputTimeRef.current.inputElement;
        if (inputTime && (inputTime.value == "" || inputTime.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Time is required",
                duration: 4000
            })

            inputTime.classList.toggle("cabf__input--error");
            inputTime.focus();
            inputTime.value = assignmentInfo.time;

            setTimeout(() => {
                inputTime.classList.toggle("cabf__input--error");
            }, 2000);

            return;
        }
        else {
            let isValid = isValidTime(inputTime.value);
            let seconds = timeToSeconds(inputTime.value);
            if (isValid == false || seconds == 0) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Time is invalid",
                    duration: 4000
                })

                inputTime.classList.toggle("cabf__input--error");
                inputTime.focus();
                inputTime.value = assignmentInfo.time;

                setTimeout(() => {
                    inputTime.classList.toggle("cabf__input--error");
                }, 2000);
                return;
            }
        }

        try {
            setIsLoading(true);

            const assignmentId = assignmentInfo.assignmentId;

            let response = await appClient.patch(`api/Assignments/${assignmentId}/time`, inputTimeRef.current.inputElement.value, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let dataRes = response.data;

            const formDataAssignQues = new FormData();

            let indexNum = 0;
            Object.keys(selectedQues).forEach((key, index) => {
                selectedQues[key].forEach((item, indexQue) => {
                    formDataAssignQues.append(`typeModels[${indexNum}].Type`, key);
                    formDataAssignQues.append(`typeModels[${indexNum}].AssignmentId`, assignmentId);
                    formDataAssignQues.append(`typeModels[${indexNum}].QuesId`, item);
                    indexNum++;
                })
            })

            response = await appClient.post(`api/AssignQues/assignments/${assignmentId}`, formDataAssignQues);
            dataRes = response.data;
            if (dataRes.success) {
                onShow(false);
                onReloadAssignment();

                toast({
                    type: "success",
                    title: "Success",
                    message: "Update assignment successfully",
                    duration: 4000
                });
            }
        }
        catch {

        }
    }

    useEffect(() => {
        inputTimeRef.current.inputElement.value = assignmentInfo.time;
        inputExpectedTimeRef.current.value = assignmentInfo.time;
        setSelectedQues(() => {
            return Array.from({ length: 7 }).reduce((acc, _, i) => {
                acc[i + 1] = [];
                return acc;
            }, {});
        })
    }, [])


    useEffect(() => {
        getQuesTypes();
    }, [])


    useEffect(() => {
        if (selectedType != null) {
            getListQuestions();
        }
    }, [selectedType])

    return (
        <div className='fixed top-0 left-0 w-full h-full z-[1001] flex items-center justify-center bg-gray-400 bg-opacity-20' onClick={(e) => onShow(false)}>
            {isLoading && <LoaderPage />}
            <div className='w-[1000px] rounded-lg shadow-lg px-[20px] h-[600px] bg-white' onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center mt-[20px]">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Expected Time</div>
                        <input
                            type='text'
                            className="lbh__input"
                            readOnly
                            ref={inputExpectedTimeRef}
                        />
                    </div>
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Time</div>
                        <MaskedInput
                            name='Time'
                            mask={timeMask}
                            placeholder="00:00:00"
                            defaultValue={"00:00:00"}
                            className="lbh__input"
                            ref={inputTimeRef}
                        />
                    </div>
                </div>

                <div className="flex items-center mt-[20px] overflow-visible">
                    <div className="flex items-center flex-1 overflow-visible">
                        <div className='cab__title--text'>Question Types</div>
                        <DropDownList data={queType} defaultIndex={defaultType} className={"border !rounded-[20px]"} placeholder={"Select question type..."} onSelectedItem={handleSelectedQuesType} />
                    </div>

                    {selectedType != null ?
                        <div className='flex items-center overflow-visible flex-1'>
                            <div className="cab__title--text">Question Id </div>
                            <DropDownList data={listQues.map((item, index) => ({ key: item.id, value: item.id }))} defaultIndex={defaultQues} className={"border !rounded-[20px] pt-0"} placeholder={"Select question id..."} onSelectedItem={handleSelectQuesId} />
                        </div>
                        :
                        <div className='flex-1'></div>
                    }
                </div>

                {selectedType != null &&
                    <>
                        <div className='flex items-center justify-between mt-[20px] border'>
                            {
                                Object.keys(selectedQues).map((key, index) => {
                                    let typeName = undefined;
                                    if (key == 1) {
                                        typeName = "Image";
                                    }
                                    else if (key == 2) {
                                        typeName = "Audio";
                                    }
                                    else if (key == 3) {
                                        typeName = "Conversation";
                                    }
                                    else if (key == 4) {
                                        typeName = "Sentence";
                                    }
                                    else if (key == 5) {
                                        typeName = "Single";
                                    }
                                    else if (key == 6) {
                                        typeName = "Double";
                                    }
                                    else {
                                        typeName = "Triple"
                                    }

                                    return (
                                        <div className='flex items-center sq__wrapper' key={index}>
                                            <div className='sq__type-name'>{typeName}:</div>
                                            <div className='sq__num'>{selectedQues[key].length}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div className='flex items-center justify-between mt-[20px] mb-[20px]'>
                            <div className='flex justify-end '>
                                <div className='qi__btn-func delete' onClick={(event) => handleDeleteQues(event)}>Undo</div>
                                <div className='qi__btn-func' onClick={(event) => handleAddQues(event)}>Add</div>
                            </div>

                            <div>
                                {
                                    selectedQues[selectedType].includes(selectedQuesId) &&
                                    <div className='qi__selected--text'>
                                        Selected
                                    </div>
                                }
                            </div>

                            <div>
                                <button className='qi__btn-func !w-[200px]' onClick={handleAddMoreQuestion}>Submit More</button>
                            </div>
                        </div>

                        {selectedType != null && selectedQuesId != null &&
                            <QuestionInfo
                                listQues={listQues}
                                quesId={selectedQuesId}
                                type={selectedType}
                            />
                        }
                    </>
                }
            </div>
        </div>
    )
}

export function AssignmentDetailListQues({ assignmentId, isTeacher = false, isReload = false }) {
    const [assignQues, setAssignQues] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 5;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(assignQues.length / rowPerPage);

    const getQuestionAsync = async () => {
        try {
            const response = await appClient.get(`api/AssignQues/assignments/${assignmentId}/normal`);
            const dataRes = response.data;
            if (dataRes.success) {
                setAssignQues(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
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

    const handleDeleteCourse = (id) => {
        let newAssignQues = assignQues.filter(c => c.assignQuesId != id);
        newAssignQues = newAssignQues.map((item, index) => ({ ...item, index: index + 1 }));
        setAssignQues(newAssignQues);
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
        if (sortConfig.length === 0) return [...assignQues];

        return [...assignQues].sort((a, b) => {
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
        getQuestionAsync();
    }, [isReload])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [assignQues, sortConfig])


    return (
        <div className='clb__wrapper'>
            <div className="clb__tbl__wrapper mt-[10px] ">
                <div className="mpt__header flex w-full items-center">
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("noNum", event)}>Question</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("courseId", event)}>Type</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("courseId", event)}>Level</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("description", event)}></div>
                </div>

                <div className='mpt__body min-h-[300px] overflow-hidden mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <AssignDetailItem key={index} detailInfo={item} onDelete={handleDeleteCourse} isTeacher={isTeacher} onReloadQuestion={getQuestionAsync} />
                        )
                    })}
                </div>

                <div className='flex justify-end items-center'>
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

function AssignDetailItem({ detailInfo, onDelete, isTeacher = false, onReloadQuestion }) {
    const [isShowInfo, setIsShowInfo] = useState(false);
    const handleViewQuestion = () => {
        setIsShowInfo(true);
    }

    console.log(detailInfo);
    let level = detailInfo?.quesInfo?.level;
    let levelName = "";
    if (level == 1) {
        levelName = "Normal"
    }
    if (level == 2) {
        levelName = "Intermediate"
    }
    if (level == 3) {
        levelName = "Hard"
    }
    if (level == 4) {
        levelName = "Very hard"
    }

    const handleDeleteQuestion = async () => {
        try {
            const confirmAnswer = confirm("Do you want to delete ?");
            if (confirmAnswer) {
                var response = await appClient.delete(`api/assignQues/${detailInfo.assignQuesId}`);
                if (response.data.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Delete question successfully",
                        duration: 4000
                    });

                    onReloadQuestion();

                }
            }
        }
        catch {

        }
    }

    return (
        <>
            <div className='mpt__row flex items-center mb-[10px]'>
                <div className="mpt__row-item w-1/4 ">Question {detailInfo.noNum}</div>
                <div className="mpt__row-item w-1/4 ">{detailInfo.type}</div>
                <div className="mpt__row-item w-1/4 ">{levelName}</div>
                <div className="mpt__row-item w-1/4 ">
                    <div className='flex items-center justify-end'>
                        <button className='adlq__btn-func w-[100px] mr-[10px]' onClick={handleViewQuestion}>View</button>
                        {
                            !isTeacher && <button className='adlq__btn-func w-[100px] delete' onClick={handleDeleteQuestion}>Remove</button>
                        }
                    </div>
                </div>
            </div>

            {isShowInfo &&
                <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1001] qi__wrapper-bg' onClick={(e) => setIsShowInfo(false)}>
                    <QuestionInfoAssignment quesId={detailInfo.assignQuesId} type={detailInfo.type} onShow={setIsShowInfo} />
                </div>
            }
        </>
    )
}

function QuestionInfoAssignment({ quesId, type, onShow }) {
    const [assignQueInfo, setAssignQueInfo] = useState(null);

    const getQuesInfo = async () => {
        try {
            const response = await appClient.get(`api/assignques/${quesId}/answer`);
            const dataRes = response.data;
            if (dataRes.success) {
                setAssignQueInfo(dataRes.message);
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getQuesInfo();
    }, [])


    return (
        <div className='w-[1200px]  bg-white p-[20px] rounded-[10px] shadow-md' onClick={(e) => e.stopPropagation()}>
            {type == "Image" && assignQueInfo?.quesInfo != null && <QuestionImage quesInfo={assignQueInfo.quesInfo} noNum={assignQueInfo.noNum} onShow={onShow} />}
            {type == "Audio" && assignQueInfo?.quesInfo != null && <QuestionAudio quesInfo={assignQueInfo.quesInfo} noNum={assignQueInfo.noNum} onShow={onShow} />}
            {type == "Conversation" && assignQueInfo?.quesInfo != null && <QuestionConversation quesInfo={assignQueInfo.quesInfo} noNum={assignQueInfo.noNum} onShow={onShow} />}
            {type == "Sentence" && assignQueInfo?.quesInfo != null && <QuestionSentence quesInfo={assignQueInfo.quesInfo} noNum={assignQueInfo.noNum} onShow={onShow} />}
            {type == "Single" && assignQueInfo?.quesInfo != null && <QuestionSingle quesInfo={assignQueInfo.quesInfo} noNum={assignQueInfo.noNum} onShow={onShow} />}
            {type == "Double" && assignQueInfo?.quesInfo != null && <QuestionDouble quesInfo={assignQueInfo.quesInfo} noNum={assignQueInfo.noNum} onShow={onShow} />}
            {type == "Triple" && assignQueInfo?.quesInfo != null && <QuestionTriple quesInfo={assignQueInfo.quesInfo} noNum={assignQueInfo.noNum} onShow={onShow} />}
        </div>
    )
}

function QuestionImage({ quesInfo, onShow, noNum }) {
    const answerInfo = quesInfo.answerInfo;
    const [selectedAnswer, setSelectedAnswer] = useState(quesInfo?.answerInfo?.correctAnswer);

    const audioRef = useRef(null);

    useEffect(() => {
        setSelectedAnswer(quesInfo?.answerInfo?.correctAnswer);
    }, [quesInfo])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [quesInfo?.audioUrl]);

    return (
        <div className='qit__wrapper flex flex-col h-full'>
            <div className="qit__title">Image Question {noNum}</div>

            <div className='flex flex-1 mt-[20px] min-h-[400px]'>
                <div className='flex-1 max-h-[500px]'>
                    <img src={APP_URL + quesInfo?.imageUrl} className=' w-full p-[20px] object-cover' />
                </div>

                <div className="flex flex-col flex-1">
                    {Object.keys(answerInfo).filter((key) => key.startsWith("answer"))
                        .map((key, index) => (
                            <div className='flex items-center qa__wrapper' key={index}>
                                <input type='radio' name='answerRdo' disabled checked={key.replace("answer", "") == selectedAnswer} className='qa__rdo mr-[10px]' />
                                <div className='qi__title-text'>{key.replace("answer", "")}</div>
                                <div className='qi__ques-info'>{quesInfo.answerInfo[key]}</div>
                            </div>
                        ))}
                </div>

            </div>
            <div className="flex justify-between items-center">
                <audio controls preload='auto' className='qi__audio' ref={audioRef}>
                    <source src={APP_URL + quesInfo.audioUrl} type="audio/mpeg" />
                </audio>

                <button className='qit__btn-func' onClick={(e) => onShow(false)}>Close</button>
            </div>
        </div>
    )
}

function QuestionAudio({ quesInfo, onShow, noNum }) {
    const answerInfo = quesInfo.answerInfo;
    const [selectedAnswer, setSelectedAnswer] = useState(quesInfo?.answerInfo?.correctAnswer);

    const audioRef = useRef(null);

    useEffect(() => {
        setSelectedAnswer(quesInfo?.answerInfo?.correctAnswer);
    }, [quesInfo])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [quesInfo?.audioUrl]);

    return (
        <div className='qit__wrapper flex flex-col h-full'>
            <div className="qit__title">Audio Questio {noNum}</div>

            <div className='flex flex-1 mt-[20px] min-h-[250px]'>
                <div className='flex-1'>
                    {Object.keys(answerInfo).filter((key) => key.startsWith("answer"))
                        .map((key, index) => (
                            <div className='flex items-center qa__wrapper' key={index}>
                                <input type='radio' name='quesRdo' disabled checked={key.replace("answer", "") == selectedAnswer} className='qa__rdo mr-[10px]' />
                                <div className='qi__title-text'>{key.replace("answer", "")}</div>
                                <div className='qi__ques-info'>{quesInfo[key]}</div>
                            </div>
                        ))}
                </div>

                <div className="flex flex-col flex-1 ml-[50px]">
                    {Object.keys(answerInfo).filter((key) => key.startsWith("answer"))
                        .map((key, index) => (
                            <div className='flex items-center qa__wrapper' key={index}>
                                <input type='radio' name='answerRdo' disabled checked={key.replace("answer", "") == selectedAnswer} className='qa__rdo mr-[10px]' />
                                <div className='qi__title-text'>{key.replace("answer", "")}</div>
                                <div className='qi__ques-info'>{quesInfo.answerInfo[key]}</div>
                            </div>
                        ))}
                </div>

            </div>
            <div className="flex justify-between items-center">
                <audio controls preload='auto' className='qi__audio' ref={audioRef}>
                    <source src={APP_URL + quesInfo.audioUrl} type="audio/mpeg" />
                </audio>

                <button className='qit__btn-func' onClick={(e) => onShow(false)}>Close</button>
            </div>
        </div>
    )
}

function QuestionConversation({ quesInfo, onShow, noNum }) {
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [quesInfo.audioUrl]);

    return (
        <div className='flex flex-col'>
            <div className="qit__title">Conversation Question {noNum}</div>

            <div className='grid grid-cols-2 gap-[20px]'>
                {
                    quesInfo.imageUrl != "" &&
                    <div className='flex justify-center'>
                        <img src={APP_URL + quesInfo?.imageUrl} className='w-full h-[260px] object-contain rounded-[8px]' />
                    </div>
                }

                {quesInfo.questions.map((item, index) => {
                    return (
                        <div key={index} className="mt-[10px]">
                            <div className='flex items-start'>
                                <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>A </div>
                                <div className='qa__ques-info'>{item?.answerA}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>B </div>
                                <div className='qa__ques-info'>{item?.answerB}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>C </div>
                                <div className='qa__ques-info'>{item?.answerC}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>D </div>
                                <div className='qa__ques-info'>{item?.answerD}</div>
                            </div>
                        </div>
                    )
                })}

            </div>

            <div className='flex justify-between items-center mt-[10px]'>
                <audio controls preload='auto' ref={audioRef} className='qi__audio'>
                    <source src={APP_URL + quesInfo?.audioUrl} type="audio/mpeg" />
                </audio>

                <button className='qit__btn-func' onClick={(e) => onShow(false)}>Close</button>
            </div>
        </div>
    )
}

function QuestionSentence({ quesInfo, onShow, noNum }) {
    const [selectedAnswer, setSelectedAnswer] = useState(quesInfo.answerInfo.correctAnswer);

    useEffect(() => {
        setSelectedAnswer(quesInfo.answerInfo.correctAnswer);
    }, [quesInfo])

    return (
        <div className='flex p-[20px] flex-col'>
            <div className="qit__title">Sentence Question {noNum}</div>

            <div className='flex items-center qa__wrapper'>
                <div className='qa__title-text !font-bold'>Question: </div>
                <div className='qa__ques-info !font-bold flex items-center !h-fit !p-0'>{quesInfo?.question}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "A"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>A </div>
                <div className='qa__ques-info'>{quesInfo?.answerA}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "B"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>B </div>
                <div className='qa__ques-info'>{quesInfo?.answerB}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "C"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>C </div>
                <div className='qa__ques-info'>{quesInfo?.answerC}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "D"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>D </div>
                <div className='qa__ques-info'>{quesInfo?.answerD}</div>
            </div>

            <div className='flex justify-end'>
                <button className='qit__btn-func' onClick={(e) => onShow(false)}>Close</button>
            </div>
        </div>
    )
}

function QuestionSingle({ quesInfo, onShow, noNum }) {
    return (
        <div className='flex flex-col'>
            <div className="qit__title">Single Question {noNum}</div>

            <div className='grid grid-cols-2 mt-[20px] gap-[20px] h-[500px]'>
                {
                    quesInfo.imageUrl != "" &&
                    <div>
                        <img src={APP_URL + quesInfo?.imageUrl} className='w-full object-cover rounded-[8px]' />
                    </div>
                }

                <div>
                    {quesInfo.questions.map((item, index) => {
                        return (
                            <div key={index} className="mt-[10px]">
                                <div className='flex items-start'>
                                    <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                    <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>A </div>
                                    <div className='qa__ques-info'>{item?.answerA}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>B </div>
                                    <div className='qa__ques-info'>{item?.answerB}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>C </div>
                                    <div className='qa__ques-info'>{item?.answerC}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>D </div>
                                    <div className='qa__ques-info'>{item?.answerD}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>

            <div className='flex justify-end mt-[10px]'>
                <button className='qit__btn-func' onClick={(e) => onShow(false)}>Close</button>
            </div>
        </div>
    )
}

function QuestionDouble({ quesInfo, onShow, noNum }) {
    return (
        <div className='flex flex-col'>
            <div className="qit__title">Double Question {noNum}</div>

            <div className='grid grid-cols-2 gap-[20px]  max-h-[550px] overflow-hidden'>
                <div className='overflow-scroll max-h-[550px]'>
                    {
                        quesInfo.imageUrl != "" &&
                        <div className='h-full'>
                            <img src={APP_URL + quesInfo?.imageUrl_1} className='w-full object-contain rounded-[8px]' />
                            <img src={APP_URL + quesInfo?.imageUrl_2} className='w-full object-contain mt-[10px]' />
                        </div>
                    }
                </div>

                <div className='h-[550px]'>
                    {quesInfo.questions.map((item, index) => {
                        return (
                            <div key={index} className="mt-[10px]">
                                <div className='flex items-start'>
                                    <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                    <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>A </div>
                                    <div className='qa__ques-info'>{item?.answerA}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>B </div>
                                    <div className='qa__ques-info'>{item?.answerB}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>C </div>
                                    <div className='qa__ques-info'>{item?.answerC}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>D </div>
                                    <div className='qa__ques-info'>{item?.answerD}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className='flex justify-end mt-[10px]'>
                <button className='qit__btn-func' onClick={(e) => onShow(false)}>Close</button>
            </div>
        </div>
    )
}

function QuestionTriple({ quesInfo, onShow, noNum }) {
    return (
        <div className='flex flex-col'>
            <div className="qit__title">Triple Question {noNum}</div>

            <div className='grid grid-cols-2 gap-[20px] max-h-[550px] overflow-hidden'>
                <div className='overflow-scroll max-h-[550px]'>
                    {
                        quesInfo.imageUrl != "" &&
                        <div className='h-full'>
                            <img src={APP_URL + quesInfo?.imageUrl_1} className='w-full object-contain rounded-[8px]' />
                            <img src={APP_URL + quesInfo?.imageUrl_2} className='w-full object-contain mt-[10px]' />
                            <img src={APP_URL + quesInfo?.imageUrl_3} className='w-full object-contain mt-[10px]' />
                        </div>
                    }
                </div>

                <div className='h-[550px]'>
                    {quesInfo.questions.map((item, index) => {
                        return (
                            <div key={index} className="mt-[10px]">
                                <div className='flex items-start'>
                                    <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                    <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>A </div>
                                    <div className='qa__ques-info'>{item?.answerA}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>B </div>
                                    <div className='qa__ques-info'>{item?.answerB}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>C </div>
                                    <div className='qa__ques-info'>{item?.answerC}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>D </div>
                                    <div className='qa__ques-info'>{item?.answerD}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className='flex justify-end mt-[10px]'>
                <button className='qit__btn-func' onClick={(e) => onShow(false)}>Close</button>
            </div>
        </div>
    )
}
export default CourseContentAssignment