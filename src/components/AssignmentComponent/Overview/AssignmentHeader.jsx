import React from 'react'
import { IMG_URL_BASE, CLIENT_URL } from '~/GlobalConstant.js';

function OverViewHeader() {
    return (
        <div className='assignment__header--wrapper flex justify-between items-center'>
            <div className='flex'>
                <a className='assignment__title-link' href='/'>LEARNING SYSTEM</a>
            </div>

            <a className='assignment__btn-logo' href={CLIENT_URL}>
                <img className='assignment__logo' src={IMG_URL_BASE + "logo.svg"}/>
            </a>
        </div>
    )
}

export default OverViewHeader