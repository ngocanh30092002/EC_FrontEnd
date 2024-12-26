import React, { useEffect, useState } from 'react'
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import MemberItem from './MemberItem';

function MemberBroad({onShowMembers, isShow, members}) {
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
            setCurrentMembers(members.slice(1));
        }
    }

    const handleHideMember = () =>{
        onShowMembers(false);
    }

    useEffect(() =>{
        setCurrentMembers([...members].slice(1));
    }, [members])

    return (
        <div className={`fixed z-[1] bottom-0 right-0 h-full bg-white overflow-hidden flex flex-col border-l ${isShow ? "w-[250px] max-w-[250px] ml-[10px]" :"max-w-0 ml-0" } transition-all duration-300  ease-out`}>
            <div className='flex justify-between items-center p-[10px]'>
                <div className='member-title'>
                    Teachers
                </div>
                <div className='p-[8px] cursor-pointer hover:opacity-80 hover:bg-slate-100 transition-all duration-300 rounded-[8px]'
                    onClick={handleHideMember}>
                    <img src={IMG_URL_BASE+ "collapse-icon.svg"} className='w-[20px]'/>
                </div>
            </div>

            {currentMembers.length != 0 && <MemberItem data={members?.[0]} />}

            <div className='member-title p-[10px]'>Members</div>

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

export default MemberBroad