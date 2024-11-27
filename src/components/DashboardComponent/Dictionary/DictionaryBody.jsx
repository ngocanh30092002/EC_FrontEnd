import React, { useEffect, useState } from 'react'
import { appClient } from '~/AppConfigs';
import DropDownList from '../../CommonComponent/DropDownList';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';

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

    useEffect(() => {
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
        const handleRemove = async() =>{
            try{
                const response = await appClient.delete(`api/userwords/${id}`)
                const data = response.data;

                if(data.success){
                    let newWords = words.filter(w => w.userWordId != id);
                    setWords(newWords);
                }
            }
            catch{

            }
        }

        handleRemove();
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
                    <span className='mr-[10px] dhp__filter-title'>Filter by</span>
                    <DropDownList data={wordTypes} defaultIndex={defaultIndex} onSelectedItem={handleFilterItem} placeholder={""} className={"border !py-[7px] !px-[15px] !w-[150px] "} />
                </div>
            </div>

            <div className='overflow-hidden grid grid-cols-3 w-full gap-[20px] p-[20px]'>
                {renderWords.map((word, index) => {
                    return (
                        <WordItemCard word={word} key={index} onDeleteItem={handleRemoveItem} />
                    )
                })}
            </div>
        </div>
    )
}


function WordItemCard({ word, onDeleteItem }) {
    const [isFavorite, setIsFavorite] = useState(word.isFavorite);
    const [flipped, setFlipped] = useState(false);

    useEffect(() =>{
        word.isFavorite = isFavorite;
    }, [isFavorite])

    useEffect(() =>{
        setIsFavorite(word.isFavorite);
    } , [word])

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

    return (
        <div className={`wic__wrapper overflow-visible w-full h-fit rounded-[10px] cursor-pointer ${flipped && "flipped"}`} onClick={(e) => setFlipped(!flipped)}>
            <div className='wic__card-inner' >
                <div className='wic__front__wrapper overflow-hidden p-[15px] rounded-[10px] border flex flex-col'>
                    <div className='flex-1'>
                        <div className='wic__img--wrapper relative'>
                            <img src={APP_URL + word.image} className='wic__img' />
                            <div className='absolute right-0 bottom-0 wic__tag-name'>{word.tag}</div>
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
    )
}

export default DictionaryBody