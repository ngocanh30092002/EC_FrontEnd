import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';

function ClassMaterialPage() {
    const [filterMode, setFilterMode] = useState(0);
    const [searchValue, setSearchValue] = useState("");
    const [materials, setMaterials] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(materials.length / rowPerPage);
    const [renderMaterials, setRenderMaterials] = useState([]);
    const { classId } = useParams();

    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
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

    const ImageWithExtension = (filePath) => {
        const extension = filePath.split('.').pop().toLowerCase();

        return `${IMG_URL_BASE + extension}-icon.svg`;
    }

    const handleErrorImage = (event) => {
        event.target.src = `${IMG_URL_BASE + "file-icon.svg"}`;
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

    const sortedDataFunc = (filterMode) => {
        let newMaterial = [...materials];
        if(filterMode != null) {
            if (filterMode == 1) {
                newMaterial = materials.filter(m => m.lessonInfo != null);
            }
            if (filterMode == 2) {
                newMaterial = materials.filter(m => m.classId != null);
            }
        }

        if (sortConfig.length === 0) return newMaterial;

        return newMaterial.sort((a, b) => {
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
        const handleGetMaterial = async () => {
            try {
                const response = await appClient.get(`api/ClassMaterials/classes/${classId}`)
                const resData = response.data;

                if (resData.success) {
                    setMaterials(resData.message);
                    setRenderMaterials(resData.message);
                }
            }
            catch {

            }
        }

        handleGetMaterial();
    }, [])

    useEffect(() => {
        let newMaterial = materials;

        if (filterMode == 1) {
            newMaterial = materials.filter(m => m.lessonInfo != null);
        }
        if (filterMode == 2) {
            newMaterial = materials.filter(m => m.classId != null);
        }

        let newRenderMaterials = newMaterial;

        if (searchValue != "") {
            const normalizedQuery = removeVietnameseTones(searchValue);
            newRenderMaterials = newRenderMaterials.filter(m => {
                console.log(removeVietnameseTones(m.title))

                return removeVietnameseTones(m.title).includes(normalizedQuery);
            });
        }

        setRenderMaterials(newRenderMaterials);
    }, [searchValue])

    useEffect(() => {
        setSortedData(sortedDataFunc(filterMode));
    }, [materials, sortConfig, filterMode])

    return (
        <div className='cmp__wrapper p-[20px]'>
            <div className='cmp__header flex justify-between items-center'>
                <div className='cmp__filter-mode flex items-center'>
                    <button className={`cmp__filter-mode-btn ${filterMode == 0 ? "active" : ""}`} onClick={(e) => setFilterMode(0)}>All</button>
                    <button className={`cmp__filter-mode-btn ml-[10px] ${filterMode == 1 ? "active" : ""}`} onClick={(e) => setFilterMode(1)}>Lessons</button>
                    <button className={`cmp__filter-mode-btn ml-[10px] ${filterMode == 2 ? "active" : ""}`} onClick={(e) => setFilterMode(2)}>Classes</button>
                </div>

                <div className='cmp__filter-input flex items-center'>
                    <div className='p-[10px]'>
                        <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[20px]' />
                    </div>
                    <input
                        placeholder='Search some thing...'
                        className='w-[200px] h-full'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
            </div>

            <div className='cmp__body mt-[10px]'>
                <div className='cmp__tbl__header flex w-full mb-[10px]'>
                    <div className="mpt__header-item w-1/3" onClick={(event) => handleSort("title", event)}>File Name</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("filePath", event)}>Type</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("fileSize", event)}>Size</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("uploadAt", event)}>Upload At</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("uploadBy", event)}>Upload By</div>
                </div>

                <div className='mpt__body min-h-[325px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <a className='cmp__tbl__row flex w-full items-center' key={index} href={APP_URL + item.filePath} target='_blank'>
                                <div className='cmp__tbl__row-item w-1/3 flex items-center'>
                                    <div>
                                        <img onError={handleErrorImage} src={ImageWithExtension(item.filePath)} className='w-[35px] object-fill' />
                                    </div>
                                    <div className='ml-[5px] line-clamp-1 cmp__row-item--title'>{item.title}</div>
                                </div>
                                <div className='cmp__tbl__row-item w-1/12'>{getFileCategory(item.filePath)}</div>
                                <div className='cmp__tbl__row-item w-1/12'>{item.fileSize}</div>
                                <div className='cmp__tbl__row-item w-1/4'>{item.uploadAt}</div>
                                <div className='cmp__tbl__row-item w-1/4'>{item.uploadBy}</div>
                            </a>
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

export default ClassMaterialPage