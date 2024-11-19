import React, { memo } from 'react'

function ExamFooter({ isFixed, message }) {
    return (
        <div className={`assignment__footer--wrapper ${isFixed ? "fixed" : ""}`}>
            <span>{message ?? "If there is any problem please keep the screen still and report to the teacher or admin"}</span>
        </div>
    )
}

export default memo(ExamFooter);