import React, { useEffect, useRef, useState } from 'react'
import "./MenuContextStyle.css"
import { appClient } from '~/AppConfigs';
import DropDownList from '../CommonComponent/DropDownList';
import toast from '../../helper/Toast';

function MenuContextPage() {
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [wordTypes, setWordTypes] = useState([]);
    const [defaultIndex, setDefaultIndex] = useState(0);
    const [selectedType, setSelectedType] = useState(null);
    const [inputTag, setInputTag] = useState("#");

    const inputMeaningRef = useRef(null);
    const inputTagRef = useRef(null)
    const handleShowBoard = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsShowBoard(true);
    }

    useEffect(() => {
        const handleContextMenu = (event) => {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                event.preventDefault();
                setMenuVisible(true);
                setMenuPosition({ x: event.pageX, y: event.pageY });
                setSelectedText(selectedText);
            } else {
                setMenuVisible(false);
            }
        };

        const handleClickOutside = (event) => {
            const menu = document.querySelector('.mcp__item');
            if (menu && !menu.contains(event.target)) {
                setMenuVisible(false);
            }
        };

        const rootElement = document.getElementById("root");
        rootElement.addEventListener("contextmenu", handleContextMenu);
        rootElement.addEventListener("click", handleClickOutside);

        return () => {
            rootElement.removeEventListener("contextmenu", handleContextMenu);
            rootElement.removeEventListener("click", handleClickOutside);
        };
    }, []);

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
        if (!menuVisible) {
            setIsShowBoard(false);
        }
    }, [menuVisible]);

    const handleMouseOut = () => {
        setMenuVisible(false);
    }

    const handleChangeTag = (e) => {
        let value = e.target.value;
        if (value.startsWith("#")) {
            setInputTag("#" + value.slice(1).toUpperCase());
        } else {
            setInputTag("#");
        }
    }

    const handleSelectedType = (item, index) => {
        setSelectedType(item);
        setDefaultIndex(index);
    }

    const handleClearInput = () => {
        inputMeaningRef.current.value = "";
        setInputTag("#");
        setDefaultIndex(0);
        setIsShowBoard(false);
        setMenuVisible(false);
    }

    const handleCreateWord = async (event) => {
        event.preventDefault();
        try {
            if (inputMeaningRef.current && (inputMeaningRef.current.value == "" || inputMeaningRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Meaning is required",
                    duration: 4000
                });

                inputMeaningRef.current.focus();
                inputMeaningRef.current.classList.toggle("mcp__error");

                setTimeout(() => {
                    inputMeaningRef.current.classList.toggle("mcp__error")
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

                setTimeout(() => {
                    inputTagRef.current.classList.toggle("mcp__error")
                }, 2000);

                return;
            }

            if (selectedType.value <= 0) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Type is required",
                    duration: 4000
                });
                return;
            }

            const formData = new FormData(event.target);
            formData.append("Type", selectedType.value);
            formData.append("Word", selectedText);

            const response = await appClient.post("api/UserWords", formData);
            const data = response.data;
            if (data.success) {
                toast({
                    type: "success",
                    title: "SUCCESS",
                    message: "Add new word successfully",
                    duration: 4000
                });

                handleClearInput();
            }
        }
        catch {

        }
    }
    return (
        <>
            {menuVisible && (
                <div
                    style={{
                        position: "absolute",
                        top: `${menuPosition.y}px`,
                        left: `${menuPosition.x}px`,
                    }}
                    className="mcp__item"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p onClick={handleShowBoard}>Add Word</p>

                    {isShowBoard && (
                        <form
                            className="absolute top-0 overflow-visible p-[20px] right-[-5%] translate-x-[100%] bg-gray-50 shadow-lg w-[300px]"
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handleCreateWord}
                        >
                            <div className="flex items-center">
                                <div className="mcp__title">Meaning: </div>
                                <input className="flex-1 mcp__input" ref={inputMeaningRef} name='Translation' />
                            </div>

                            <div className="flex items-center mt-[10px]">
                                <div className="mcp__title">Tag: </div>
                                <input
                                    className="flex-1 mcp__input"
                                    name='Tag'
                                    value={inputTag}
                                    ref={inputTagRef}
                                    onChange={handleChangeTag}
                                />
                            </div>

                            <div className="flex items-center overflow-visible mt-[10px]">
                                <div className="mcp__title">Type: </div>
                                <DropDownList
                                    data={wordTypes}
                                    hideDefault={true}
                                    defaultIndex={defaultIndex}
                                    className={"flex-1 rounded-[5px] "}
                                    onSelectedItem={handleSelectedType}
                                    tblClassName={"flex-1 !h-[200px]"}
                                />
                            </div>

                            <div className='flex flex-1 mt-[10px]'>
                                <button className='mcp__btn-func' type='submit'>Create</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}


export default MenuContextPage