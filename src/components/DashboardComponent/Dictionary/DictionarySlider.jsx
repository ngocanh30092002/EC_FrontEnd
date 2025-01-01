import React, { useEffect, useRef, useState } from 'react'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import  toast  from '@/helper/Toast';

function DictionarySlider({onShowTraining}) {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isSmooth, setIsSmooth] = useState(true);
    const contentRef = useRef(null);
    const itemWidth = 400;

    useEffect(() => {
        const getFavoriteWords = async () => {
            try {
                const response = await appClient.get("api/UserWords/user/favorite");
                const data = response.data;
                if (data.success) {
                    setWords(data.message);
                    if(data.message.length == 0){
                        toast({
                            type: "warning",
                            title: "Warning Info",
                            message: "There are no words in the favorites list.",
                            duration: 4000
                        });
                        
                        onShowTraining(false);
                    }
                    else{
                        setTotalItems(data.message.length);
                    }
                }
            }
            catch {

            }
        }

        getFavoriteWords();
    }, [])

    const prevSlide = () => {
        if (currentIndex === 0) {
            setIsSmooth(false);
            setCurrentIndex(totalItems - 1);
        } else {
            setIsSmooth(true);
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const nextSlide = () => {
        if (currentIndex === totalItems - 1) {
            setIsSmooth(false);
            setCurrentIndex(0);
        } else {
            setIsSmooth(true);
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const shuffleArray = (array) => {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[i]];
        }
        return shuffledArray;
    }

    const handleShuffleArray = () => {
        let newWords = shuffleArray(words);
        setWords(newWords);
    }

    const handleOutSlider = () =>{
        onShowTraining(false);
    }

    useEffect(() => {
        const contentStyle = contentRef.current.style;

        if (isSmooth) {
            contentStyle.transition = "transform 0.5s ease-in-out";
        } else {
            contentStyle.transition = "none";
        }

        contentStyle.transform = `translateX(-${currentIndex * itemWidth + 150 * currentIndex}px)`;

    }, [currentIndex, isSmooth, itemWidth]);

    return (
        <div className='fixed z-[1000] top-0 left-0 flex flex-col justify-center w-screen h-screen ds__wrapper p-[20px]'>
            <div className='w-full flex items-center justify-between'>
                <div className='ds__number-words'>{currentIndex + 1} / {totalItems}</div>
                <div className='flex-1 flex justify-center ds__title'>Favorite Words</div>
                <div className='flex items-center'>
                    <button className='ds__btn-func' onClick={handleShuffleArray}>
                        <img src={IMG_URL_BASE + "shuffle-icon.svg"} className='w-[22px]' />
                    </button>
                    <button className='ds__btn-func' onClick={handleOutSlider}>
                        <img src={IMG_URL_BASE + "out-icon.svg"} className='w-[22px]' />
                    </button>
                </div>
            </div>

            <div className="ds__carousel flex justify-center items-center w-full flex-1">
                <button className="ds__carousel-btn prev" onClick={prevSlide}>
                    <img src={IMG_URL_BASE + "pre_page_icon.svg"} className='w-[50px]' />
                </button>
                <div className="ds__carousel__wrapper h-full overflow-y-hidden" >
                    <div className='h-full flex w-[500px] overflow-y-hidden'>
                        <div
                            className="ds__carousel--content  p-[40px]"
                            ref={contentRef}>
                            {words.map((item, index) => (
                                <div
                                    key={index}
                                    className={`ds__carousel--item overflow-y-hidden ${currentIndex == index && "selected "}`}
                                >
                                    <WordItemCard word={item} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button className="ds__carousel-btn next" onClick={nextSlide}>
                    <img src={IMG_URL_BASE + "next_page_icon.svg"} className='w-[50px]' />
                </button>
            </div>
        </div>
    );
}


function WordItemCard({ word }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className={`wic__wrapper overflow-visible w-full h-fit rounded-[10px] cursor-pointer ${flipped && "flipped"}`} onClick={(e) => setFlipped(!flipped)}>
            <div className='wic__card-inner' >
                <div className='wic__front__wrapper overflow-hidden rounded-[10px] border flex flex-col'>
                    <div className='flex-1 p-[15px]'>
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

                    <div className='wic__btn-flip mt-[20px]'>Tap to flip the card</div>
                </div>

                <div className='wic__end__wrapper overflow-hidden'>
                    {word.translation}
                </div>
            </div>

        </div>
    )
}
export default DictionarySlider