import React from 'react'

function ClassContentHeader({ pageNum, onChangePage }) {
    return (
        <div className='flex items-center justify-center'>
            <button className={`cch__btn ${pageNum == 0 && "active"}`} onClick={(e) => onChangePage(0)}>Schedule</button>
            <button className={`cch__btn ${pageNum == 1 && "active"}`} onClick={(e) => onChangePage(1)}>Homework</button>
            <button className={`cch__btn ${pageNum == 2 && "active"}`} onClick={(e) => onChangePage(2)}>Material</button>
            <button className={`cch__btn ${pageNum == 3 && "active"}`} onClick={(e) => onChangePage(3)}>History</button>
        </div>
    )
}

export default ClassContentHeader