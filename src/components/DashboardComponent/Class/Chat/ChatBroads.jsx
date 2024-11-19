import React, { useContext, useEffect, useRef, useState } from 'react';
import { appClient } from '~/AppConfigs';
import { APP_API, APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import { ClassPageContext } from '../ClassPage';



function ChatBroads({ chats, isShow }) {
    let indexStart = chats.length - 4 < 0 ? 0 : chats.length - 4;
    return (
        <div className={`flex fixed bottom-0 ${isShow ? "right-[265px]" : "right-[15px]"} transition-all duration-200`}>
            {chats.slice(chats.length - 2, chats.length).map((item, index) => {
                return (
                    item?.isCollapse == false ? <ChatItem chat={item} key={index} /> : null
                )
            })}

            <div className='flex flex-col items-center justify-end'>
                {chats.slice(indexStart, chats.length).map((item, index) => {
                    return (
                        item?.isCollapse == true ? <ChatCollapse item={item} key={index} /> : null
                    )
                })}
            </div>
        </div>
    )
}

function ChatCollapse({ item }) {
    const { chats } = useContext(ClassPageContext);

    const handleOpenChat = () => {
        chats.open(item);
    }
    return (
        <img src={item.image ? APP_URL + item.image : IMG_URL_BASE + "unknown_user.jpg"} className='chat-collapse-item' onClick={handleOpenChat} />
    )
}

function ChatItem({ chat }) {
    const [messages, setMessages] = useState(() => {
        return chat.messages ?? [];
    });

    const [typingMessage, setTypingMessage] = useState("");
    const { chats } = useContext(ClassPageContext);
    const chatWrapperRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const getMessages = () => {
            appClient.get(`api/chats?receiverId=${encodeURIComponent(chat.userId)}`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        chat.messages = data.message;
                        setMessages(data.message);
                    }
                })
        }


        getMessages();




    }, [])

    useEffect(() => {
        setMessages(chat.messages ?? []);

        setTimeout(() => {
            scrollToBottom();
        }, 100)
    }, [chat.messages])

    const scrollToBottom = () => {
        if (chatWrapperRef) {
            chatWrapperRef.current.scrollTop = chatWrapperRef.current.scrollHeight;
        }
    }

    const handleTyingMessage = (e) => {
        setTypingMessage(e.target.value);
    }

    const handleCloseChat = () => {
        chats.close(chat);
    }

    const handleCollapseChat = () => {
        chats.collapse(chat);
    }

    const handleSendMessage = () => {
        chats.send(typingMessage, chat.userId);
        setTypingMessage("");
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            chats.send(typingMessage, chat.userId);
            setTypingMessage("");
        }
    }

    const handleReadMessage = () => {
        chats.seen(chat.userId);
    }

    const handleChooseFile = (event) =>{
        if(fileInputRef){
            fileInputRef.current.click();
        }
    }

    const handleFileChange = (event) =>{
        const file = event.target.files[0];
        
        const handleUploadFile = async () =>{
            const formData = new FormData();
            formData.append("file", file);

            const responseData = await appClient.post("api/chatfiles", formData);
            const message = responseData.data.message;

            chats.sendFile(message, chat.userId)
        }

        handleUploadFile();
    }

    return (
        <div className='w-[320px] h-[400px] bg-white ml-[5px] flex flex-col chat-item__wrapper'>
            <div className='chat-item__header'>
                <img src={chat?.image ? APP_URL + chat.image : IMG_URL_BASE + "unknown_user.jpg"} className='chat-item__image-user' />
                <div className='chat-item__user-name line-clamp-1 flex-1'>{chat?.userName}</div>
                <div
                    className='p-[10px] cursor-pointer hover:bg-slate-200 rounded-[4px] transition-all duration-150'
                    onClick={handleCollapseChat}>
                    <img src={IMG_URL_BASE + "collapse-icon.svg"} className='w-[15px] ' />
                </div>
                <div
                    className='p-[10px] cursor-pointer  hover:bg-slate-200 rounded-[4px] transition-all duration-150'
                    onClick={handleCloseChat}>
                    <img src={IMG_URL_BASE + "close.svg"} className='w-[15px] ' />
                </div>
            </div>
            <div className='flex-1 chat-item__chat--wrapper' ref={chatWrapperRef}>
                {
                    messages.map((item, index) => {
                        return (
                            <ChatItemRender itemInfo={item} key={index} />
                        )
                    })
                }
            </div>
            <div className='flex bg-gray-100 p-[5px] items-center'>
                <div className='p-[10px] cursor-pointer' onClick={handleChooseFile}>
                    <img src={IMG_URL_BASE + "send-file-icon.svg"} className='w-[18px]' />
                </div>
                <input
                    value={typingMessage}
                    onChange={handleTyingMessage}
                    className='chat-item__input'
                    placeholder='Aa'
                    onKeyDown={handleKeyDown}
                    onFocus={handleReadMessage} />
                <div className='p-[10px] cursor-pointer' onClick={handleSendMessage}>
                    <img src={IMG_URL_BASE + "send-icon.svg"} className='w-[18px]' />
                </div>

                <input className='hidden' type='file' ref={fileInputRef} onChange={handleFileChange}/>
            </div>
        </div>
    )
}

function ChatItemRender({ itemInfo }) {
    let renderItem = undefined;
    const { viewerImage, chats } = useContext(ClassPageContext);
    let timer;

    const isImageFile = (extension) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        const normalizedExtension = extension.toLowerCase();
        return imageExtensions.includes(normalizedExtension);
    }

    const handleSaveFileImage = (event) => {
        const spanUrl = event.currentTarget.querySelectorAll("span")[1];

        if (spanUrl) {
            const filePath = spanUrl.innerHTML;
            const fileName = spanUrl.innerHTML.split('/').pop();

            fetch(`${APP_API}Files?fileName=${encodeURIComponent(filePath)}`, {
                method: 'GET',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
        }
    };

    const handleClickViewImage = (e) => {
        viewerImage.show(e.target.src);
    }

    const handleMouseLeave = (event) => {
        const spanTimes = event.currentTarget.querySelectorAll("span");
        const lastSpan = spanTimes[spanTimes.length - 1];

        clearTimeout(timer);
        lastSpan.style.height = "0";
    }

    const handleMouseEnter = (event) => {
        const spanTimes = event.currentTarget.querySelectorAll("span");
        const lastSpan = spanTimes[spanTimes.length - 1];

        timer = setTimeout(() => {
            lastSpan.style.height = '20px';
            lastSpan.style.marginTop = '2px';
        }, 800);
    }

    const handleRemoveMessage = () =>{
        chats.deleteMessage(itemInfo);
    }

    if (itemInfo.isDelete) {
        renderItem = (
            <div className={`${itemInfo.isOwnSender ? "chat-item__send--wrapper" : "chat-item__receive--wrapper "}`}>
                <span className={`${itemInfo.isOwnSender ? "chat-item__message-send" : "chat-item__message-receive"} message-delete`}>
                    This message has been deleted.
                </span>
            </div>
        )
    }
    else if (itemInfo.file) {
        let isImage = isImageFile(itemInfo.file.fileType);
        renderItem = (
            <div className={`${itemInfo.isOwnSender ? "chat-item__send--wrapper" : "chat-item__receive--wrapper "}`}>
                <div className={`flex items-center ${itemInfo.isOwnSender ? 'flex-row-reverse' : ''}`}>
                    {isImage ?
                        (
                            <span className='chat-item__message-img' onClick={handleClickViewImage}>
                                <img src={APP_URL + itemInfo.file.filePath} alt="chat image" />
                            </span>
                        ) :
                        (
                            <span className='chat-item__message-file' onClick={handleSaveFileImage}>
                                <img src={`${itemInfo.isOwnSender ? IMG_URL_BASE + "file-icon-white.svg" : IMG_URL_BASE + "file-icon.svg"}`} className='w-[20px]' alt="file icon" />
                                <span className='chat-item_file-text'>{itemInfo.file.fileName}</span>
                                <span className='hidden'>{itemInfo.file.filePath}</span>
                            </span>
                        )}
                    
                    <div className={` ${itemInfo.isOwnSender ? "mr-[10px] flex" : "ml-[10px] hidden"} chat-item-remove`} onClick={handleRemoveMessage}>
                        <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[25px] p-[4px]'/>
                    </div>
                </div>
                <span className='chat-item__time'>
                    {itemInfo.sendAt}
                </span>
            </div>
        )
    }
    else {
        renderItem = (
            <div className={`${itemInfo.isOwnSender ? "chat-item__send--wrapper" : "chat-item__receive--wrapper"}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className={`flex items-center ${itemInfo.isOwnSender ? 'flex-row-reverse' : ''}`}>
                    <span className={`${itemInfo.isOwnSender ? "chat-item__message-send" : "chat-item__message-receive"}`}>
                        {itemInfo.message}
                    </span>

                    <div className={` ${itemInfo.isOwnSender ? "mr-[10px] flex" : "ml-[10px] hidden"} chat-item-remove`} onClick={handleRemoveMessage}>
                        <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[25px] p-[4px]'/>
                    </div>
                </div>
                <span className='chat-item__time'>
                    {itemInfo?.isSeen && "Seen "}
                    {itemInfo.sendAt}
                </span>

            </div>
        )
    }

    return (
        renderItem
    )
}

export default ChatBroads