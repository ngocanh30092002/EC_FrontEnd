import React, { useEffect, useMemo, useState } from 'react'
import "./RoleStyle.css"
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';
import toast from '../../../helper/Toast';
import DropDownList from '../../CommonComponent/DropDownList';

function RolePage() {
    const [roles, setRoles] = useState([]);
    const [renderRoles, setRenderRoles] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const handleGetRoles = async () => {
        try {
            const response = await appClient.get("api/roles");
            const dataRes = response.data;
            if (dataRes.success) {
                setRoles(dataRes.message);
                setRenderRoles(dataRes.message);
            }
        }
        catch {

        }
    }

    useEffect(() => {
        handleGetRoles();
    }, [])

    useEffect(() => {
        if (inputValue == "") {
            setRenderRoles([...roles]);
        }
        else {
            const newRoles = roles.filter(r => r.toUpperCase().includes(inputValue.toUpperCase()));
            setRenderRoles(newRoles);
        }
    }, [inputValue])

    const handleRemoveRoles = async (item) => {
        try {
            const response = await appClient.delete(`api/roles/${item}`);
            const dataRes = response.data;
            if (dataRes) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Role deleted successfully",
                    duration: 4000
                });

                handleGetRoles();
            }
            else {
                toast({
                    type: "error",
                    title: "Error",
                    message: "This role is currently assigned to a user and cannot be deleted",
                    duration: 4000
                });
            }
        }
        catch {

        }
    }

    const handleChangeInput = (event) => {
        setInputValue(event.target.value);
    }

    const handleAddRole = async () => {
        try {
            if (inputValue == "" || inputValue == null) {
                toast({
                    type: "error",
                    title: "Error",
                    message: "Name role is required",
                    duration: 4000
                });
                return;
            }
            const response = await appClient.post("api/roles", inputValue, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const dataRes = response.data;

            if (dataRes) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "New role added successfully",
                    duration: 4000
                });

                handleGetRoles();

                setInputValue("");
            }
            else {
                toast({
                    type: "error",
                    title: "Error",
                    message: "Add new role failed",
                    duration: 4000
                });
            }
        }
        catch {

        }
    }

    return (
        <div className='rp__wrapper p-[20px]'>
            <div className="rp__role--header">
                <div className='flex items-center justify-center flex-1'>
                    <input className='rp__role--input' value={inputValue} onChange={handleChangeInput} placeholder='Enter name role ...' />
                    <button className='rp__role--btn' onClick={handleAddRole}>Add</button>
                </div>

                <div className='flex w-full justify-center mt-[20px] min-h-[62px]'>
                    {renderRoles.map((item, index) => {
                        return (
                            <div className='rp__role-item w-1/5 ' key={index}>
                                <div>{item}</div>
                                <img src={IMG_URL_BASE + "close-white-icon.svg"} className='rp__role-item--img' onClick={(e) => handleRemoveRoles(item)} />
                            </div>
                        )
                    })}
                </div>

                <ListUsersRoles roles={roles} />
            </div>
        </div>
    )
}

function ListUsersRoles({ roles }) {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState("");
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const userPerPage = 6;
    const indexLastItem = currentPage * userPerPage;
    const indexFirstItem = indexLastItem - userPerPage;
    const totalPage = Math.ceil(users.length / userPerPage);

    const handleGetUsers = async () => {
        try {
            const response = await appClient.get("api/admin/users/roles");
            const dataRes = response.data;
            if (dataRes.success) {
                setUsers(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        handleGetUsers();
    }, [])

    const handleChangePage = (event) => {
        if (event.target.value == "") {
            setCurrentPage(1);
        }
        else {
            setCurrentPage(event.target.value.replace(/[^0-9]/g, ''));
        }
    }

    const handleInputPage = (event) => {
        setCurrentPage(currentPage.replace(/[^0-9]/g, ''));
    }

    const handleSort = (key, event) => {
        setSortConfig(prevConfig => {
            const existingIndex = prevConfig.findIndex((item) => item.key === key);
            event.target.classList.add("active");

            if (existingIndex > -1) {
                const updatedConfig = [...prevConfig];
                const currentDirection = updatedConfig[existingIndex].direction;

                if (currentDirection === 'desc') {
                    updatedConfig[existingIndex].direction = 'asc';
                    event.target.classList.remove("desc");
                } else {
                    updatedConfig.splice(existingIndex, 1);
                    event.target.classList.toggle("active");
                }

                return updatedConfig;
            }

            event.target.classList.add("desc");
            return [...prevConfig, { key, direction: 'desc' }];
        });
    }

    const getValueByPath = (object, path) => {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
    };

    const sortedDataFunc = () => {
        if (sortConfig.length === 0) return [...users];

        return [...users].sort((a, b) => {
            for (const { key, direction } of sortConfig) {
                const valueA = getValueByPath(a, key);
                const valueB = getValueByPath(b, key);

                if (valueA == null && valueB == null) {
                    continue;
                }
                if (valueA == null) {
                    return direction === "asc" ? -1 : 1;
                }
                if (valueB == null) {
                    return direction === "asc" ? 1 : -1;
                }

                if (valueA < valueB) {
                    return direction === "asc" ? -1 : 1;
                }
                if (valueA > valueB) {
                    return direction === "asc" ? 1 : -1;
                }
            }
            return 0;
        });
    };


    useEffect(() => {
        setSortedData(sortedDataFunc())
    }, [users, sortConfig])

    useEffect(() => {
        if (selectedFilter != "") {
            setSortedData(prev => {
                const sortData = sortedDataFunc();
                const prevArr = sortData.filter(i => i.roles.includes(selectedFilter));
                console.log(prevArr);
                return [...prevArr];
            })
        }
        else {
            setSortedData(sortedDataFunc())
        }
    }, [selectedFilter])

    return (
        <div className='rp__user-role__wrapper mt-[20px]'>
            <div className='flex justify-between'>
                <div className='rpur--title'>List of users</div>
                <div className='flex items-center'>
                    <div className='mr-[10px] rpur__title'>Filter</div>
                    <select className='rpru__select__wrapper border' value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                        <option value={""}>All</option>
                        {roles.map((item, index) => (
                            <option key={index} className='rpur__select-item' value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='rpur__tbl__wrapper'>
                <div className="mpt__header flex w-full mb-[10px]">
                    <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("index", event) }}>No</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => { handleSort("userEmail", event) }}>User Info</div>
                    <div className="mpt__header-item w-1/3">Roles</div>
                    <div className="mpt__header-item w-1/4"></div>
                </div>
                <div className='mpt__body min-h-[500px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <UserRoleItem userInfo={item} key={index} index={item.index} roles={roles} />
                        )
                    })}
                </div>

                <div className='flex justify-end items-center mt-[20px]'>
                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => 1)}>
                        <img src={IMG_URL_BASE + "previous.svg"} className="w-[25px] " />
                    </button>

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => {

                        return prev == 1 ? 1 : parseInt(prev) - 1;
                    })}>
                        <img src={IMG_URL_BASE + "pre_page_icon.svg"} className="w-[25px]" />
                    </button>

                    <input className='mpt__page-input' value={currentPage} onChange={handleChangePage} onInput={handleInputPage} />

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => parseInt(prev) + 1)}>
                        <img src={IMG_URL_BASE + "next_page_icon.svg"} className="w-[25px]" />
                    </button>

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => totalPage)}>
                        <img src={IMG_URL_BASE + "next.svg"} className="w-[25px]" />
                    </button>
                </div>
            </div>

        </div>
    )
}

function UserRoleItem({ userInfo, index, roles }) {
    const [userRoles, setUserRoles] = useState(userInfo.roles);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const handleRoleSelected = (item) => {
        if (item) {
            setSelectedRole(item?.value);
        }
        else {
            setSelectedRole(null);
        }
    }

    const handleRemoveRole = async (item) => {
        try {
            const response = await appClient.delete(`api/roles/users/${userInfo.userId}?roleName=${item}`)

            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Delete role successfully",
                    duration: 4000
                });

                userInfo.roles = [...userInfo.roles.filter(r => r != item)];
                setUserRoles([...userInfo.roles])
            }

        }
        catch {

        }
    }

    const handleAddRoles = async () => {
        if (isEditing) {
            if (selectedRole != null) {
                try {
                    const isExistRoles = userInfo.roles.some(r => r == selectedRole);
                    if (isExistRoles) {
                        toast({
                            type: "warning",
                            title: "Warning Role",
                            message: "This role already existed",
                            duration: 4000
                        });
                        setIsEditing(!isEditing);
                        setSelectedRole(null);

                        return;
                    }

                    const response = await appClient.post(`api/roles/users/${userInfo.userId}`, selectedRole, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })

                    const dataRes = response.data;
                    if (dataRes.success) {
                        toast({
                            type: "success",
                            title: "Successfully",
                            message: "Add role successfully",
                            duration: 4000
                        });

                        userInfo.roles = [...userInfo.roles, selectedRole];
                        setUserRoles([...userInfo.roles])
                    }
                }
                catch {

                }
            }
        }

        setIsEditing(!isEditing);
    }

    const handleMouseOut = (event) => {
        // const wrap = event.currentTarget;
        // const toElement = event.relatedTarget;

        // if (wrap.contains(toElement)) {
        //     return;
        // }

        // setIsEditing(false);
    }

    useEffect(() => {
        setUserRoles(userInfo.roles);
    }, [userInfo]);
    return (
        <div className={`mpt__row flex items-center mb-[10px] overflow-visible ${isEditing && "editing"}`} onMouseOut={handleMouseOut}>
            <div className="mpt__row-item w-1/12 "># {index}</div>
            <div className="mpt__row-item w-1/3 flex justify-between ">
                <div>
                    <img src={userInfo.userImage ? APP_URL + userInfo.userImage : IMG_URL_BASE + "unknown_user.jpg"} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                </div>

                <div className='flex-1 ml-[10px] flex flex-col justify-between'>
                    <div className='line-clamp-1 mpt__row-item--title'>
                        <input
                            value={userInfo.userName}
                            readOnly
                            className='w-full bg-transparent'
                        />
                    </div>
                    <div className='line-clamp-1 mpt__row-item--title'>
                        <input
                            type='email'
                            value={userInfo.userEmail}
                            className='w-full bg-transparent'
                            readOnly
                        />
                    </div>
                </div>

            </div>
            <div className="mpt__row-item w-1/3 flex items-center flex-wrap gap-y-[10px]">
                {userRoles.map((item, index) => {
                    return (
                        <div key={index} className='mpt__row-item--role relative overflow-visible'>
                            <span>{item}</span>
                            {isEditing && <img src={IMG_URL_BASE + "close.svg"} className='w-[13px] p-[2px] translate-x-[20%] translate-y-[-20%] absolute top-0 right-0 bg-gray-200 rounded-[50%]' onClick={(e) => handleRemoveRole(item)} />}
                        </div>
                    )
                })}
            </div>
            <div className="mpt__row-item w-1/4 flex items-center justify-end overflow-visible">
                {isEditing && <DropDownList data={roles.map((item) => ({ key: item, value: item }))} defaultIndex={-1} placeholder={"Add Roles ..."} onSelectedItem={handleRoleSelected} className={"border !w-[160px]  !rounded-none"} />}
                <button className='w-[40px] h-[40px] ml-[10px]' onClick={handleAddRoles}>
                    {
                        !isEditing ?
                            <img src={IMG_URL_BASE + "plus-icon.svg"} className='w-full p-[10px]' />
                            :
                            <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-full p-[6px]' />
                    }
                </button>
            </div>
        </div>
    )
}

export default RolePage