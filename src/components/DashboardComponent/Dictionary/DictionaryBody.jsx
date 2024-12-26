import React, { useEffect, useRef, useState } from 'react'
import { appClient } from '~/AppConfigs';
import DropDownList from '../../CommonComponent/DropDownList';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import toast from '../../../helper/Toast';

function DictionaryBody({ inputSearch, reloadTrigger, onShowTraining }) {
    const [words, setWords] = useState([]);
    const [wordTypes, setWordTypes] = useState([]);
    const [renderWords, setRenderWords] = useState([]);
    const [filterMode, setFilterMode] = useState(0);
    const [defaultIndex, setDefaultIndex] = useState(-1);
    const [selectedType, setSelectedType] = useState("");

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

    const getWords = async () => {
        try {
            const response = await appClient.get("api/userwords/user");
            const data = response.data;
            if (data.success) {
                setWords(data.message);
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getWords();
    }, [reloadTrigger])

    useEffect(() => {
        let newWords = [...words];
        if (filterMode == 1) {
            newWords.sort((a, b) => {
                const tagA = a.tag.toLowerCase();
                const tagB = b.tag.toLowerCase();

                if (tagA < tagB) return -1;
                if (tagA > tagB) return 1;
                return 0;
            });

        }
        if (filterMode == 2) {
            newWords = words.filter(w => w.isFavorite == true);
        }

        setRenderWords([...newWords]);
        setDefaultIndex(-1);
    }, [filterMode]);

    useEffect(() => {
        if (inputSearch != "") {
            let newWords = renderWords.filter(w => w.word.toLowerCase().includes(inputSearch.toLowerCase()))
            setRenderWords([...newWords]);
        }
        else {
            let newWords = [...words];
            if (filterMode == 1) {
                newWords.sort((a, b) => {
                    const tagA = a.tag.toLowerCase();
                    const tagB = b.tag.toLowerCase();

                    if (tagA < tagB) return -1;
                    if (tagA > tagB) return 1;
                    return 0;
                });

            }
            if (filterMode == 2) {
                newWords = words.filter(w => w.isFavorite == true);
            }

            if (selectedType != "") {
                newWords = newWords.filter(w => w.type == selectedType);
            }

            setRenderWords([...newWords]);
        }

    }, [inputSearch])

    useEffect(() => {
        let newWords = [...words];

        if (filterMode == 1) {
            newWords.sort((a, b) => {
                const tagA = a.tag.toLowerCase();
                const tagB = b.tag.toLowerCase();

                if (tagA < tagB) return -1;
                if (tagA > tagB) return 1;
                return 0;
            });

        }
        if (filterMode == 2) {
            newWords = words.filter(w => w.isFavorite == true);
        }

        if (selectedType != "") {
            newWords = newWords.filter(w => w.type == selectedType);
        }

        setRenderWords(newWords);

    }, [words])

    const handleFilterItem = (item, index) => {
        if (item != null) {
            let newWords = words.filter(w => w.type == item.key);
            setSelectedType(item.key);
            setRenderWords(newWords);
        }
        else {
            setRenderWords(words);
            setSelectedType("");
        }

        setDefaultIndex(index);
    }

    const handleRemoveItem = (id) => {
        const handleRemove = async () => {
            try {
                const response = await appClient.delete(`api/userwords/${id}`)
                const data = response.data;

                if (data.success) {
                    let newWords = words.filter(w => w.userWordId != id);
                    setWords(newWords);
                }
            }
            catch {

            }
        }

        handleRemove();
    }

    const handleReloadCards = () =>{
        getWords();
    }

    return (
        <div className='w-full min-h-[500px]'>
            <div className='dph__header-search__wrapper mt-[20px] flex justify-between items-center w-full px-[20px] overflow-visible'>
                <div className='flex items-center'>
                    <button className={`dph__search-btn mr-[10px] ${filterMode == 0 && "active"}`} onClick={(e) => setFilterMode(0)}>All</button>
                    <button className={`dph__search-btn mr-[10px] ${filterMode == 1 && "active"}`} onClick={(e) => setFilterMode(1)}>Tag</button>
                    <button className={`dph__search-btn mr-[10px] ${filterMode == 2 && "active"}`} onClick={(e) => setFilterMode(2)}>Favorite</button>
                </div>

                <div className='overflow-visible flex items-center'>
                    <span className='mr-[10px] dhp__filter-title min-w-[60px]'>Filter by</span>
                    <DropDownList data={wordTypes} defaultIndex={defaultIndex} onSelectedItem={handleFilterItem} placeholder={""} className={"border !py-[7px] !px-[15px] !w-[150px] "} />
                </div>
            </div>

            <div className='overflow-hidden grid grid-cols-3 w-full gap-[20px] p-[20px]'>
                {renderWords.map((word, index) => {
                    return (
                        <WordItemCard word={word} key={index} onDeleteItem={handleRemoveItem} onReloadCards={handleReloadCards}/>
                    )
                })}
            </div>
        </div>
    )
}


function WordItemCard({ word, onDeleteItem, onReloadCards }) {
    const [isFavorite, setIsFavorite] = useState(word.isFavorite);
    const [isShowEdit, setIsShowEdit] = useState(false);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        word.isFavorite = isFavorite;
    }, [isFavorite])

    useEffect(() => {
        setIsFavorite(word.isFavorite);
    }, [word])

    const handleAddFavorite = () => {
        const handleSetFavorite = async () => {
            try {
                const response = await appClient.patch(`api/userwords/${word.userWordId}/is-favorite?isFavorite=${!isFavorite}`);
                const data = response.data;
                if (!data.success) {
                    setIsFavorite(false);
                }
            }
            catch {

            }
        }

        setIsFavorite(!isFavorite);
        handleSetFavorite();
    }

    const handleRemoveWord = () => {
        onDeleteItem(word.userWordId);
    }

    const handleShowEditBoard = () => {
        setIsShowEdit(true);
    }


    return (
        <>
            <div className={`wic__wrapper overflow-visible w-full h-fit rounded-[10px] cursor-pointer ${flipped && "flipped"}`} onClick={(e) => setFlipped(!flipped)}>
                <div className='wic__card-inner' >
                    <div className='wic__front__wrapper overflow-hidden p-[15px] rounded-[10px] border flex flex-col'>
                        <div className='flex-1'>
                            <div className='wic__img--wrapper relative'>
                                <img src={APP_URL + word.image} className='wic__img' />
                                <div className='absolute right-0 bottom-0 wic__tag-name'>{word.tag}</div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <button className='absolute right-0 top-0' onClick={handleShowEditBoard}>
                                        <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[30px] p-[5px]' />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center justify-center'>
                            <div className='wic__word'>{word.word}</div>
                            <div className='wic__phonetic'>{word.phonetic}</div>
                        </div>

                        <div className='flex justify-center wic__type'>({word.type})</div>

                        <div className='flex items-center mt-[20px] ' onClick={(e) => e.stopPropagation()}>
                            <button className={`flex-1 wic__btn ${isFavorite && "favorite"}`} onClick={handleAddFavorite}>
                                {!isFavorite ?
                                    <img src={IMG_URL_BASE + "heart-icon.svg"} className='w-[20px]' />
                                    :
                                    <img src={IMG_URL_BASE + "heart-red-icon.svg"} className='w-[20px]' />
                                }
                            </button>
                            <button className='flex-1 wic__btn delete' onClick={handleRemoveWord}>
                                <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[20px]' />
                            </button>
                        </div>
                    </div>

                    <div className='wic__end__wrapper overflow-hidden'>
                        {word.translation}
                    </div>
                </div>
            </div>

            {isShowEdit && <WordCardInfoBoard wordInfo={word} onShow={setIsShowEdit} onReload = {onReloadCards}/>}
        </>
    )
}

function WordCardInfoBoard({ wordInfo, onShow, onReload }) {
    const [imageFileUrl , setImageFileUrl] = useState(()=>{
        return wordInfo.image == "" ? null : APP_URL  + wordInfo.image;
    })
    const [imageFile, setImageFile] = useState(null);
    const [wordTypes, setWordTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [defaultIndex, setDefaultIndex] = useState(0);

    const inputWordRef = useRef(null);
    const inputTranslationRef = useRef(null);
    const inputPhoneticRef = useRef(null);
    const inputTagRef = useRef(null);

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleDropFile = (event) => {
        event.preventDefault();
        let file = event.dataTransfer.files[0];

        if (file) {
            setImageFile(file);
        }
        else {
            setImageFile(null);
        }
    }

    const handleUploadFile = (event) => {
        let file = event.target.files[0];

        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
        else {
            setImageFile(null);
        }
    }

    useEffect(() => {
        const getWordType = async () => {
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

        getWordType();
    }, [])

    useEffect(() => {
        handleReloadInfo();
    }, [wordInfo, wordTypes])

    const handleReloadInfo = () => {
        inputWordRef.current.value = wordInfo.word;
        inputTranslationRef.current.value = wordInfo.translation;
        inputPhoneticRef.current.value = wordInfo.phonetic;
        inputTagRef.current.value = wordInfo.tag;

        if (wordTypes.length != 0) {
            var index = wordTypes.findIndex(i => i.key == wordInfo.type);
            setDefaultIndex(index);
            setSelectedType(wordTypes[index])
        }
    }

    const handleChangeTag = (e) => {
        let value = e.target.value;
        if (value.startsWith("#")) {
            inputTagRef.current.value = "#" + value.slice(1).toUpperCase();
        } else {
            inputTagRef.current.value = "#";
        }
    }

    const handleSubmitForm = async (event) => {
        event.preventDefault();

        try {
            if (inputWordRef.current && (inputWordRef.current.value == "" || inputWordRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Word is required",
                    duration: 4000
                });

                inputWordRef.current.focus();
                inputWordRef.current.classList.toggle("wcib__error");
                inputWordRef.current.value = wordInfo.word;

                setTimeout(() => {
                    inputWordRef.current.classList.toggle("wcib__error")
                }, 2000);

                return;
            }

            if (inputTranslationRef.current && (inputTranslationRef.current.value == "" || inputTranslationRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Translation is required",
                    duration: 4000
                });

                inputTranslationRef.current.focus();
                inputTranslationRef.current.classList.toggle("wcib__error");
                inputTranslationRef.current.value = wordInfo.translation;

                setTimeout(() => {
                    inputTranslationRef.current.classList.toggle("wcib__error")
                }, 2000);

                return;
            }

            if (inputTagRef.current && inputTagRef.current.value == "#") {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Tag is required",
                    duration: 4000
                });

                inputTagRef.current.focus();
                inputTagRef.current.classList.toggle("mcp__error");
                inputTagRef.current.value = wordInfo.tag;

                setTimeout(() => {
                    inputTagRef.current.classList.toggle("mcp__error")
                }, 2000);

                return;
            }

            if (selectedType?.value <= 0) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Type is required",
                    duration: 4000
                });
                return;
            }

            let formData = new FormData(event.target);
            formData.append("Type", selectedType.value);
            if (imageFile) {
                formData.append("Image", imageFile);
            }

            const response = await appClient.put(`api/UserWords/${wordInfo.userWordId}`, formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "SUCCESS",
                    message: "Add new word successfully",
                    duration: 4000
                });

                onShow(false);
                onReload();
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const handleSelectedType = (item, index) => {
        setSelectedType(item);
        setDefaultIndex(index);
    }
    return (
        <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center wcib__wrapper z-[1000]' onClick={(e) => onShow(false)}>
            <form onSubmit={handleSubmitForm} className='w-[800px] h-[400px] flex bg-white p-[20px] overflow-visible' onClick={(e) => e.stopPropagation()}>
                <label
                    htmlFor='input-file'
                    id="drop-area"
                    className='bg-gray-50 rounded-[10px] w-[300px] h-full flex justify-center items-center flex-col cursor-pointer'
                    onDragOver={handleDragOver}
                    onDrop={handleDropFile}>
                    <input type='file' className='hidden' id="input-file" onChange={(e) => handleUploadFile(e)} />
                    {
                        imageFileUrl == null ?
                            <>
                                <img src={IMG_URL_BASE + "upload-cloud-icon.png"} className='w-[60px]' />
                                <div className='hpsf__drag-title font-bold'>Drag and drop or click to upload files </div>
                            </>
                            :
                            <img src={imageFileUrl} className='w-full h-full object-cover' />

                    }
                </label>

                <div className='ml-[30px] flex-1 overflow-visible flex flex-col'>
                    <div className='flex-1 overflow-visible'>
                        <div className="flex items-center mt-[10px]">
                            <div className="wcib__title-text">Word</div>
                            <input className="wcib__input" name='Word' ref={inputWordRef} />
                        </div>

                        <div className="flex items-center mt-[10px]">
                            <div className="wcib__title-text">Translation</div>
                            <input className="wcib__input" name='Translation' ref={inputTranslationRef} />
                        </div>

                        <div className="flex items-center mt-[10px]">
                            <div className="wcib__title-text">Phonetic</div>
                            <input className="wcib__input" name='Phonetic' ref={inputPhoneticRef} />
                        </div>

                        <div className="flex items-center mt-[10px]">
                            <div className="wcib__title-text">Tag</div>
                            <input className="wcib__input" name='Tag' ref={inputTagRef} onChange={handleChangeTag} />
                        </div>

                        <div className="flex items-center mt-[10px] overflow-visible">
                            <div className="wcib__title-text">Type</div>
                            <DropDownList
                                data={wordTypes}
                                defaultIndex={defaultIndex}
                                className={"border border-[#cccccc]"}
                                tblClassName={"!h-[165px]"}
                                hideDefault={true}
                                onSelectedItem={handleSelectedType}
                            />
                        </div>
                    </div>

                    <div className='flex mt-[20px]'>
                        <button className='wcib__btn-func' type='submit'>
                            Update
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
export default DictionaryBody