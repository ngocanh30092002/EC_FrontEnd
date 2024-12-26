import React, { useState } from 'react'

function ChatBoard() {
    const [isShowBoard, setIsShowBoard] = useState(false);
    const handleShowChatSideBar = () => {

    }
    return (
        <div className='fixed top-0 right-0 '>
            <div className='w-[50px] rounded-[50%] h-[50px] bg-black' onClick={handleShowChatSideBar}></div>


        </div>
    )
}

export default ChatBoard