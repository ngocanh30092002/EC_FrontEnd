import toast from '@/helper/Toast';
import * as signalR from '@microsoft/signalr';
import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { APP_API, IMG_URL_BASE } from '~/GlobalConstant.js';
import { ViewerImage } from '../../../../../DashboardComponent/Class/ClassDetail/ClassDetailPage';
import ChatBroads from './ChatBoards';
import MemberBoard from './MemberBoard';

export const AdminClassPageContext = createContext();

function ChatPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isShowMembers, setIsShowMember] = useState(false);
    const [isShowViewerImage, setIsShowViewerImage] = useState(false);
    const [imgSrc, setImgSrc] = useState("");
    const [chats, setChats] = useState([]);
    const [members, setMembers] = useState([])

    const [chatConnection, setChatConnection] = useState(null);

    useEffect(() => {
        if (!classId) {
            navigate(-1);
            toast({
                type: "error",
                duration: 5000,
                title: "Error",
                message: "This page cannot be accessed."
            })
        }

    }, [])

    useEffect(() => {
        const connectChatToServer = async () => {
            const chatConnection = new signalR.HubConnectionBuilder()
                .withUrl(`${APP_API}hub/chats`, {
                    withCredentials: true
                })
                .withAutomaticReconnect([3000, 3000, 3000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            chatConnection.on("ReceiverError", (errorMess) => {
                toast({
                    type: "error",
                    duration: 5000,
                    message: errorMess,
                    title: "SignalR Server Error"
                })
            })

            chatConnection.on("Online", (userId) => {
                handleSetMemberOnline(userId);
            })

            chatConnection.on("Offline", (userId) => {
                handleSetMemberOffline(userId);
            })

            chatConnection.on("ReceiveMessage", (data) => {
                if (data.isOwnSender == false) {
                    setChats(preChats => {
                        let index = preChats.findIndex(c => c.userId == data.senderId);
                        if (index != -1) {
                            preChats[index].messages = [...preChats[index].messages, data];
                            return [...preChats];
                        }

                        return preChats;
                    })

                    setMembers((preMembers) => {
                        let index = preMembers.findIndex(m => m.userId == data.senderId);
                        if (index != -1) {
                            preMembers[index].isRead = data.isRead,
                                preMembers[index].isDelete = data.isDelete,
                                preMembers[index].lastMessage = data?.file ? data.file.fileName : data.message

                            return [...preMembers]
                        }

                        return preMembers;
                    })
                }
                else {
                    setChats(preChats => {
                        let index = preChats.findIndex(c => c.userId == data.receiverId);
                        if (index != -1) {
                            preChats[index].messages = [...preChats[index].messages, data];
                            return [...preChats];
                        }

                        return preChats;
                    })

                    setMembers((preMembers) => {
                        let index = preMembers.findIndex(m => m.userId == data.receiverId);
                        if (index != -1) {
                            preMembers[index].isRead = true,
                                preMembers[index].isDelete = data.isDelete,
                                preMembers[index].lastMessage = data?.file ? data.file.fileName : data.message

                            return [...preMembers]
                        }

                        return preMembers;
                    })
                }
            })

            chatConnection.on("ReadMessageForSender", (data) => {
                setChats((preChats) => {
                    let index = preChats.findIndex(c => c.userId == data);
                    if (index != -1) {
                        let lastIndex = preChats[index].messages.length - 1;
                        preChats[index].messages.forEach((msg, i) => msg.isSeen = i === lastIndex)
                        return [...preChats];
                    }

                    return preChats;
                })
            })

            chatConnection.on("RemoveMessage", (messageInfo) => {
                if (messageInfo.isOwnSender == false) {
                    setChats((preChats) => {
                        let index = preChats.findIndex(c => c.userId == messageInfo.senderId);
                        if (index != -1) {
                            let messageIndex = preChats[index].messages.findIndex(m => m.messageId == messageInfo.messageId);

                            if (messageIndex != -1) {
                                preChats[index].messages[messageIndex] = {
                                    ...messageInfo
                                }

                                return [...preChats];
                            }
                        }

                        return preChats;
                    })

                    setMembers((preMembers) => {
                        let index = preMembers.findIndex(m => m.userId == messageInfo.senderId);
                        if (index != -1) {
                            preMembers[index].isRead = messageInfo.isRead,
                                preMembers[index].isDelete = messageInfo.isDelete,
                                preMembers[index].lastMessage = "This message has been deleted."

                            return [...preMembers]
                        }

                        return preMembers;
                    })
                }
                else {
                    setChats((preChats) => {
                        let index = preChats.findIndex(c => c.userId == messageInfo.receiverId);
                        if (index != -1) {
                            let messageIndex = preChats[index].messages.findIndex(m => m.messageId == messageInfo.messageId);
                            if (messageIndex != -1) {
                                preChats[index].messages[messageIndex] = {
                                    ...messageInfo
                                }

                                return [...preChats];
                            }
                        }

                        return preChats;
                    })

                    setMembers((preMembers) => {
                        let index = preMembers.findIndex(m => m.userId == messageInfo.receiverId);
                        if (index != -1) {
                            preMembers[index].isRead = true,
                                preMembers[index].isDelete = messageInfo.isDelete,
                                preMembers[index].lastMessage = "This message has been deleted."

                            return [...preMembers]
                        }

                        return preMembers;
                    })
                }
            })

            try {
                await chatConnection.start();
            } catch (err) {
                console.error(err);
            }

            setChatConnection(chatConnection);
        }

        connectChatToServer();
    }, [])

    useEffect(() => {
        if (chatConnection) {
            const handleGetMembers = async (classId) => {
                const responseMembers = await appClient.get(`api/Chats/class/${classId}/student`);
                const dataMembers = responseMembers.data.message;


                const onlineUser = await chatConnection.invoke("GetOnlineUsers", "")

                const resultMembers = dataMembers.map((item, index) => {
                    let isExist = onlineUser.some(u => u == item.userId);
                    item.online = isExist;

                    return item;
                });

                setMembers(resultMembers);
            }

            handleGetMembers(classId);
        }

        return () => {
            if (chatConnection) {
                chatConnection.stop()
                    .then(() => console.log("SignalR disconnected."))
                    .catch((err) => console.error("Error while disconnecting SignalR:", err));
            }
        };
    }, [chatConnection])

    const handleAddChat = (data) => {
        data.isCollapse = false;
        data.isRead = true;

        let newChats = chats.filter(c => c.userId != data.userId);

        setChats([...newChats, data]);
    }

    const handleShowImage = (src) => {
        setIsShowViewerImage(true);
        setImgSrc(src);
    }

    const handleCloseChat = (data) => {
        let newChats = chats.filter(c => c.userId != data.userId);
        setChats(newChats);
    }

    const handleCollapseChat = (data) => {
        data.isCollapse = true;
        let newChats = chats.filter(c => c.userId != data.userId);
        console.log(data);
        setChats([...newChats, data]);
    }

    const handleOpenChat = (data) => {
        data.isCollapse = false;
        let newChats = chats.filter(c => c.userId != data.userId);

        setChats([...newChats, data]);
    }

    const handleClick = () => {
        setIsShowMember(prev => !prev);
    }

    const handleSetMemberOnline = (userId) => {
        setMembers((preMembers) => {
            let newMembers = preMembers.map((item) => {
                if (item.userId == userId) {
                    item.online = true;
                }
                return item;
            })

            return newMembers
        })
    }

    const handleSetMemberOffline = (userId) => {
        setMembers((preMembers) => {
            let newMembers = preMembers.map((item) => {
                if (item.userId == userId) {
                    item.online = false;
                }
                return item;
            })

            return newMembers
        })
    }

    const handleSendMessage = (message, to) => {
        if (chatConnection) {
            chatConnection.invoke("SendMessage", {
                ReceiverId: to,
                Message: message
            });
        }
    }

    const handleSeenMessage = (userId) => {
        if (chatConnection) {
            chatConnection.invoke("ReadMessage", userId);

            setMembers((prevMember) => {
                let index = prevMember.findIndex(m => m.userId == userId);
                if (index != -1) {
                    prevMember[index].isRead = true;

                    return [...prevMember];
                }

                return prevMember;
            })
        }
    }

    const handleDeleteMessage = (messageInfo) => {
        if (chatConnection) {
            chatConnection.invoke("RemoveMessage", messageInfo.messageId)
        }
    }

    const handleSendFile = (fileId, to) => {
        if (chatConnection) {
            chatConnection.invoke("SendMessage", {
                ReceiverId: to,
                Message: "",
                FileId: fileId
            });
        }
    }

    const classData = {
        chats: {
            add: handleAddChat,
            close: handleCloseChat,
            collapse: handleCollapseChat,
            open: handleOpenChat,
            send: handleSendMessage,
            sendFile: handleSendFile,
            seen: handleSeenMessage,
            deleteMessage: handleDeleteMessage
        },
        viewerImage: {
            show: handleShowImage
        },
        members: {
            online: handleSetMemberOnline,
            offline: handleSetMemberOffline
        }
    }
    return (
        <AdminClassPageContext.Provider value={classData}>
            <div className='flex relative w-[40px] h-[40px]'>
                <ChatBroads chats={chats} isShow={isShowMembers} />

                <MemberBoard members={members} onShowMembers={setIsShowMember} isShow={isShowMembers} />

                {isShowViewerImage && <ViewerImage src={imgSrc} onShowViewerImage={setIsShowViewerImage} />}


                <button
                    onClick={handleClick}
                    className={`btn-chat-broad p-[4px] w-[40px] h-[40px] flex items-center justify-center`}
                >
                    <img src={IMG_URL_BASE + "chat-broad-icon.svg"} className='w-[27px] p-[3px]' />
                </button>
            </div>
        </AdminClassPageContext.Provider>
    )
}

export default ChatPage