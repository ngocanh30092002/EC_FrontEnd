import React, { useState } from 'react';
import DictionaryHeader from './DictionaryHeader';
import DictionaryBody from './DictionaryBody';
import "./DictionaryStyle.css"
import DictionarySlider from './DictionarySlider';

function DictionaryPage() {
    const [inputSearch, setInputSearch] = useState("");
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [isShowTraining, setIsShowTraining] = useState(false);

    const handleSearchWords = (item) =>{
        setInputSearch(item);
    }

    const handleReloadTrigger = () =>{
        setReloadTrigger(prev => !prev)
    }

    const handleShowTraining = (value) =>{
        setIsShowTraining(value);
    }


    return (
        <div className='dp__wrapper overflow-visible'>
            <DictionaryHeader onSearchWords={handleSearchWords} onReloadTrigger = {handleReloadTrigger} onShowTraining ={handleShowTraining}/>
            <DictionaryBody inputSearch={inputSearch} reloadTrigger={reloadTrigger} />
            {isShowTraining && <DictionarySlider onShowTraining ={handleShowTraining} />}
        </div>
    )
}

export default DictionaryPage