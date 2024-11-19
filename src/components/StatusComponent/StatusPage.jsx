import React, { useEffect, useState } from 'react'
import "./StatusStyle.css"
import { CLIENT_URL } from '~/GlobalConstant.js';

function StatusPage({status}) {
    const [item, setItem] = useState({});
    const infos = [
        {
            status: 404,
            title: "We are sorry, Page not found!",
            message: "The page you are looking for might have been removed had its name changed or is temporarily unavailable."
        },
        {
            status: 403,
            title: "Access Denied!",
            message: "You do not have permission to access this page. Please check your credentials or contact the administrator for assistance."
        }
    ]

    useEffect(() =>{
        const itemInfo = infos.find((item) => item.status === status);
        setItem(itemInfo);
    },[status])
    return (
        <div id="status-page">
            <div className="status-wrapper">
                <div className="status-404">
                    <h1>{item?.status}</h1>
                </div>
                <h2>{item?.title}</h2>
                <p>{item?.message}</p>
                <a href={CLIENT_URL} className='btn-back-link'>Back To Homepage</a>
            </div>
        </div>
    )
}

export default StatusPage