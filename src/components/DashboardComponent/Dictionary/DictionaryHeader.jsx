import React, { useEffect, useRef, useState } from 'react'
import DropDownList from '../../CommonComponent/DropDownList';
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';
import "./DictionaryStyle.css"
import { IMG_URL_BASE } from '~/GlobalConstant.js';

function DictionaryHeader({ onSearchWords, onReloadTrigger, onShowTraining }) {
    const [isShowAddBroad, setIsShowAddBroad] = useState(false);
    const [isFavoriteAll, setIsFavoriteAll] = useState(true);
    const [wordTypes, setWordTypes] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [inputSearch, setInputSearch] = useState("");
    const [inputWord, setInputWord] = useState("");
    const [inputFileName, setInputFileName] = useState("");
    const [inputTag, setInputTag] = useState("#");
    const [inputPhonetic, setInputPhonetic] = useState("");
    const [inputTranslation, setInputTranslation] = useState("");
    const [selectedWordType, setSelectedWordType] = useState(1);
    const inputFileRef = useRef(null);

    useEffect(() => {
        const getWordTypes = async () => {
            try {
                const response = await appClient.get("api/UserWords/word-types");
                const data = response.data;
                if (data.success) {
                    setWordTypes(data.message);
                }
            }
            catch {

            }
        }

        getWordTypes();
    }, [])

    const handleSearchClick = () => {
        onSearchWords(inputSearch);
        setInputSearch("");
    }

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            onSearchWords(inputSearch);
            setInputSearch("");
        }
    }

    const handleAddClick = () => {
        setIsShowAddBroad(!isShowAddBroad);
    }

    const handleClickUploadImage = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        }
    }

    const handleChangeFile = (event) => {
        let file = event.target.files[0];
        if (file) {
            setUploadFile(file);
            setInputFileName(file.name);
        }
    }

    const handleChangeTag = (e) => {
        let value = e.target.value;
        if (value.startsWith("#")) {
            setInputTag("#" + value.slice(1).toUpperCase());
        } else {
            setInputTag("#");
        }
    }

    const handleSubmitAddWord = () => {
        const handleSubmitWord = async () => {
            try {
                if (inputWord == null || inputWord == "") {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Word is required",
                        duration: 4000
                    });
                    return;
                }

                if (inputTranslation == null || inputTranslation == "") {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Translation is required",
                        duration: 4000
                    });
                    return;
                }

                if (inputPhonetic == null || inputPhonetic == "") {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Translation is required",
                        duration: 4000
                    });
                    return;
                }

                if (inputTag == null || inputTag == "#") {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Tag is required",
                        duration: 4000
                    });
                    return;
                }

                if (uploadFile == null) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "File image is required",
                        duration: 4000
                    });
                    return;
                }

                if (selectedWordType == null) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Type is required",
                        duration: 4000
                    });
                    return;
                }

                const formData = new FormData();
                formData.append("Word", inputWord);
                formData.append("Translation", inputTranslation);
                formData.append("Phonetic", inputPhonetic);
                formData.append("Image", uploadFile);
                formData.append("Type", selectedWordType);
                formData.append("Tag", inputTag);

                const response = await appClient.post("api/UserWords", formData);
                const data = response.data;

                if (data.success) {
                    setIsShowAddBroad(false);
                    onReloadTrigger();
                    toast({
                        type: "success",
                        title: "Add Successfully",
                        message: "Add new word is successfully",
                        duration: 4000
                    });
                    return;
                }

            }
            catch {

            }
        }

        handleSubmitWord();
    }

    const handleSelectedItem = (item) => {
        setSelectedWordType(item?.value);
    }

    const handlePratice = () => {
        onShowTraining(true);
    }

    const handleUnFavoriteAll = async () => {
        try {
            const response = await appClient.put(`api/userwords/favorite?isFavorite=${isFavoriteAll}`);
            const data = response.data;
            if (data.success) {
                onReloadTrigger();
                setIsFavoriteAll(!isFavoriteAll)
            }
        }
        catch {

        }
    }

    const handleChangeInputWord = (event) => {
        setInputSearch(event.target.value);
    }



    return (
        <div className='dph__wrapper flex justify-between px-[20px] items-center w-full overflow-visible bg-white'>
            <div className={`flex flex-1 items-center relative ${isShowAddBroad ? "overflow-visible" : "overflow-hidden"} bg-white`}>
                <input className='dph__input-search' placeholder='Search or add some words...' value={inputSearch} onChange={handleChangeInputWord} onKeyDown={handleKeyDown} />
                <button className='dph__input-btn !border-l-0' onClick={handleSearchClick}>Search</button>
                <button className='dph__input-btn !border-l-0' onClick={handleAddClick}>Add</button>

                <div className={`dph__add-broad__wrapper bg-gray-100  flex flex-col !translate-x-[50%] ${!isShowAddBroad ? "!translate-y-[-100%] !z-[-1]" : " p-[20px] !translate-y-[100%]"} !opacity-100  overflow-visible !z-10`}>
                    <div className='flex items-center justify-between flex-1'>
                        <div className='flex items-center flex-1'>
                            <div className='dph__add-title'>New word</div>
                            <div className='dph__add-input flex-1'>
                                <input
                                    className='w-full'
                                    value={inputWord}
                                    onChange={(e) => setInputWord(e.target.value)}
                                    placeholder='New word'
                                />
                            </div>
                        </div>

                        <div className='flex items-center flex-1 ml-[20px]'>
                            <div className='dph__add-title'>Translation</div>
                            <div className='dph__add-input flex-1'>
                                <input
                                    className='w-full'
                                    value={inputTranslation}
                                    onChange={(e) => setInputTranslation(e.target.value)}
                                    placeholder='Meaning of vocabulary'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center justify-between mt-[20px] flex-1'>
                        <div className='flex items-center flex-1'>
                            <div className='dph__add-title'>Phonetic</div>
                            <div className='dph__add-input flex-1'>
                                <input
                                    className='w-full'
                                    value={inputPhonetic}
                                    onChange={(e) => setInputPhonetic(e.target.value)}
                                    placeholder='Phonetic of vocabulary'
                                />
                            </div>
                        </div>

                        <div className='flex items-center flex-1 ml-[20px]'>
                            <div className='dph__add-title'>Image</div>
                            <div className='dph__add-input flex-1'>
                                <input type='file' className='hidden' ref={inputFileRef} accept="image/*" onChange={handleChangeFile} />
                                <input
                                    className='w-full cursor-pointer'
                                    readOnly={true}
                                    placeholder='Click to upload image ...'
                                    value={inputFileName}
                                    onClick={handleClickUploadImage}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center mt-[20px] flex-1 ${isShowAddBroad && "overflow-visible"}`}>
                        <div className='flex items-center flex-1'>
                            <div className='dph__add-title'>Tag</div>
                            <div className='dph__add-input flex-1'>
                                <input className='w-full' value={inputTag} onChange={handleChangeTag} />
                            </div>
                        </div>
                        <div className='flex items-center overflow-visible flex-1 ml-[20px]'>
                            <div className='dph__add-title'>Type</div>
                            <div className="dph__selection-types flex-1 overflow-visible">
                                <DropDownList data={wordTypes} defaultIndex={0} onSelectedItem={handleSelectedItem} placeholder={"Select type"} />
                            </div>
                        </div>
                    </div>

                    <div className='flex w-full justify-end mt-[15px]'>
                        <button className='dph__add-broad--btn' onClick={handleSubmitAddWord}>Submit</button>
                    </div>
                </div>
            </div>

            <div className='dph__btn-func flex items-center' onClick={handlePratice}>
                <img src={IMG_URL_BASE + "practice-icon.svg"} className='w-[22px] mr-[5px]' />
                Practice
            </div>
            <div className='dph__btn-func flex items-center' onClick={handleUnFavoriteAll}>
                {
                    isFavoriteAll ?
                        <img src={IMG_URL_BASE + "heart-white-icon.svg"} className='w-[20px] mr-[5px]' />
                        :
                        <img src={IMG_URL_BASE + "no-heart-icon.svg"} className='w-[20px] mr-[5px]' />
                }
                {
                    isFavoriteAll ?
                        "Favorite"
                        :
                        "UnFavorite"
                }
            </div>
        </div>
    )
}

export default DictionaryHeader