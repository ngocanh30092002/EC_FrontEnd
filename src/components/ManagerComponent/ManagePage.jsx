import React, { useEffect } from 'react'

const ManagePage = () => {
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.forEach((value, key) => {
            sessionStorage.setItem(key, value); // Hoặc localStorage.setItem
        });

        history.replaceState(null, '', location.pathname);
    })
    return (
        <h1>Helloo</h1>
    )
}

export default ManagePage