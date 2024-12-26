import React, { useContext, useEffect, useState } from 'react'
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { AdminClassPageContext } from './ChatPage';

function MemberBoard({members, onShowMembers, isShow}) {
    const [currentMembers, setCurrentMembers] = useState(members);
    const [isSlice, setIsSlice] = useState(true);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        const items = currentMembers.filter(m => {
            return m.userName.toLowerCase().includes(query)
        });

        if (items.length != 0) {
            setCurrentMembers(items);
        }
        if (e.target.value == "") {
            setCurrentMembers(members);
        }
    }

    const handleHideMember = () => {
        onShowMembers(false);
    }

    useEffect(() => {
        setCurrentMembers(members);
    }, [members])

    return (
        <div className={`fixed z-[1] bottom-0 right-0 h-full bg-white overflow-hidden flex flex-col border-l ${isShow ? "w-[250px] max-w-[250px] ml-[10px]" : "max-w-0 ml-0"} transition-all duration-300  ease-out`}>
            <div className='flex justify-between items-center p-[10px]'>
                <div className='member-title'>
                    Members
                </div>
                <div className='p-[8px] cursor-pointer hover:opacity-80 hover:bg-slate-100 transition-all duration-300 rounded-[8px]'
                    onClick={handleHideMember}>
                    <img src={IMG_URL_BASE + "collapse-icon.svg"} className='w-[20px]' />
                </div>
            </div>

            <div className='overflow-scroll member-list__wrapper flex-1'>
                {
                    currentMembers.map((item, index) => {
                        return (
                            <MemberItem key={index} data={item} />
                        )
                    })
                }
            </div>

            <div className='justify-items-end flex items-center border-t px-[10px]'>
                <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[25px] p-[2px]' />
                <input
                    className='member-search-input'
                    placeholder='Search member'
                    onChange={handleSearchChange}
                />
            </div>
        </div>
    )
}

function MemberItem({ data }) {
    const {chats} = useContext(AdminClassPageContext);
    let [message, setMessage ] = useState("");
    
    useEffect(() =>{
        if(data.isDelete == true){
            setMessage("This message has been deleted.");
        }
        else if(data.lastMessage){
            setMessage(data.lastMessage);
        }
        else{
            setMessage("Say hi with friend");
        }
    }, [data.lastMessage])

    const handleShowChat = () => {
        chats.add(data);
    }

    return (
        <div className='member-item__wrapper flex items-center' onClick={handleShowChat}>
            <div className='inline-block relative z-0 overflow-visible'>
                <img src={data?.image ? APP_URL + data?.image : IMG_URL_BASE + "unknown_user.jpg"} className='mi__image ' />

                <div className={`mi__image-status ${data?.online == true ? "online" : ""}`}></div>
            </div>

            <div className='flex-1 ml-[10px]'>
                <div className='mi__name-user line-clamp-1'>
                    {data?.userName}
                </div>

                <div className='mi__last-message line-clamp-1'>
                    {message}
                </div>
            </div>

            {
                data?.isRead === false && data?.lastMessage && <div className='mi__read-noti'></div>
            }
        </div>
    )
}


export default MemberBoard