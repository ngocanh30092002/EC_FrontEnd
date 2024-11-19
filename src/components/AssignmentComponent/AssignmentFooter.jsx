import React, { memo } from 'react'

function AssignmentFooter({isFixed = true}) {
    return (
        <div className={`assignment__footer--wrapper ${isFixed ? "fixed" : ""}`}>
            <span>If there are any problems, please contact phone number 0354964500</span>
        </div>
    )
}

export default memo(AssignmentFooter);