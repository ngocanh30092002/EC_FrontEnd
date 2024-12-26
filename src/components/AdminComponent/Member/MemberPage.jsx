import React, { useEffect, useState, useRef, useMemo } from 'react'
import "./MemberStyle.css"
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import MaskedInput from 'react-text-mask';
import { appClient } from '~/AppConfigs';
import toast from './../../../helper/Toast';
import NewMember from './NewMember';
import LoaderPage from '../../LoaderComponent/LoaderPage';

function MemberPage() {
    const [users, setUsers] = useState([]);
    const [isShowAddBroad, setIsShowAddBroad] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const userPerPage = 6;
    const indexLastItem = currentPage * userPerPage;
    const indexFirstItem = indexLastItem - userPerPage;
    const totalPage = Math.ceil(users.length / userPerPage);

    const getUsersInfo = async () => {
        try {
            const response = await appClient.get("api/admin/users");
            const data = response.data;
            if (data.success) {
                setUsers(data.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    const handleReloadUser = () => {
        getUsersInfo();
    }


    useEffect(() => {
        getUsersInfo();
    }, [])


    const handleChangePage = (event) => {
        if (event.target.value == "") {
            setCurrentPage(1);
        }
        else {
            setCurrentPage(event.target.value.replace(/[^0-9]/g, ''));
        }
    }

    const handleDeteteUser = (userId) => {
        let newUsers = users.filter(u => u.userId != userId);
        newUsers = newUsers.map((item,index) => ({...item,index: index + 1}));

        setUsers(newUsers);
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

    const sortedData = useMemo(() => {
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
    }, [users, sortConfig]);

    return (
        <div className='member-page__wrapper w-full h-full p-[20px]'>
            <div className='flex items-center justify-between mb-[10px]'>
                <div className='member-page__title'>Current Users</div>
                <button className='member__page__btn--add' onClick={(e) => setIsShowAddBroad(true)}>Add User</button>
            </div>

            <div className='member-page__tbl'>
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("index", event) }}>No</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => { handleSort("userEmail", event) }}>User Info</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => { handleSort("emailConfirm", event) }}>Email Confirm</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => { handleSort("dateOfBirth", event) }}>Date Of Birth</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => { handleSort("phoneNumber", event) }}>Phone Number</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => { handleSort("lock", event) }}>Lock</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => { handleSort("address", event) }}>Address</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[390px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <MemberItem data={item} noNum={item.index} key={index} onDeleteUser={handleDeteteUser} />
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

            {isShowAddBroad && <NewMember onShowBroad={setIsShowAddBroad} onTriggerReload={handleReloadUser} />}
        </div>
    )
}

function MemberItem({ data, noNum, onDeleteUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(data.emailConfirm);
    const [selectedLock, setSelectedLock] = useState(data.lock);
    const [inputUserName, setInputUserName] = useState(data.userName);
    const [inputEmail, setInputEmail] = useState(data.userEmail);
    const [inputDate, setInputDate] = useState(data.dateOfBirth);
    const [inputPhone, setInputPhone] = useState(data.phoneNumber);
    const [inputAddress, setInputAddress] = useState(data.address ?? "");
    const dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
    const phoneMask = [/0/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/,];

    const handleResetInput = () => {
        setSelectedEmail(data.emailConfirm)
        setSelectedLock(data.lock)
        setInputUserName(data.userName)
        setInputEmail(data.userEmail)
        setInputDate(data.dateOfBirth)
        setInputPhone(data.phoneNumber)
        setInputAddress(data.address ?? "")
    }

    const handleEditClick = () => {
        if (!isEditing) {
            setIsEditing(prev => !prev);
        }
        else {
            const handleUpdate = async () => {
                if (inputUserName == "" || inputUserName == null) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "User name is invalid",
                        duration: 4000
                    });

                    handleResetInput();
                    return;
                }

                if (inputEmail == "" || inputEmail == null) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Email is invalid",
                        duration: 4000
                    });

                    handleResetInput();
                    return;
                }


                if (inputDate) {
                    const [month, day, year] = inputDate.split("/");
                    const date = new Date(year, month - 1, day);
                    const isValid = date.getFullYear() === parseInt(year) && date.getMonth() === month - 1 && date.getDate() === parseInt(day)

                    if (!isValid) {
                        toast({
                            type: "error",
                            title: "Error",
                            message: "Date of birth is invalid",
                            duration: 4000
                        });

                        handleResetInput();
                        return;
                    }

                }
                if (inputPhone && inputPhone.length < 10) {
                    toast({
                        type: "error",
                        title: "Error",
                        message: "Phone number is invalid",
                        duration: 4000
                    });

                    handleResetInput();
                    return;
                }

                const formData = new FormData();
                formData.append("UserId", data.userId);
                formData.append("UserName", inputUserName);
                formData.append("UserEmail", inputEmail);
                if (inputDate) {
                    formData.append("DateOfBirth", inputDate);
                }
                if (inputPhone) {
                    formData.append("PhoneNumber", inputPhone);
                }
                if (inputAddress) {
                    formData.append("Address", inputAddress);
                }
                formData.append("EmailConfirm", selectedEmail);
                formData.append("Locked", selectedLock);


                let confirmAnswer = confirm("Are you sure to update this user ?");
                if (confirmAnswer) {
                    const response = await appClient.put(`api/admin/users`, formData, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    const resData = response.data;

                    if (resData.success) {
                        setIsEditing(prev => !prev);
                        toast({
                            type: "success",
                            title: "Successfully",
                            message: "Update information successfully",
                            duration: 4000
                        });
                        return
                    }

                    handleResetInput();
                }


            }

            handleUpdate();
        }

    }

    const handleRemoveClick = () => {
        const handleDeleteUser = async () => {
            try {
                setIsLoading(true);
                const response = await appClient.delete(`api/admin/user/${data.userId}`)
                const resData = response.data;
                if (resData.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Delete successfully",
                        duration: 4000
                    });

                    setIsEditing(prev => !prev);
                    onDeleteUser(data.userId);
                }
                else {
                    handleResetInput();
                }

                setIsLoading(false);
            }
            catch {
                setIsLoading(false);
                handleResetInput();
            }
        }

        const confirmAnswer = confirm("Are you sure to delete this user?");
        if (confirmAnswer) {
            handleDeleteUser();
        }
    }

    const handleChangePassword = () => {
        setIsShow(true);
    }

    useEffect(() => {
        handleResetInput();
    }, [data])

    return (
        <div className={`mpt__row flex items-center mb-[10px] ${isEditing && "editing"}`}>
            <div className="mpt__row-item w-1/12 "># {noNum}</div>
            <div className="mpt__row-item flex justify-between w-1/3">
                <div>
                    <img src={data.userImage ? APP_URL + data.userImage : IMG_URL_BASE + "unknown_user.jpg"} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                </div>

                <div className='flex-1 ml-[10px] flex flex-col justify-between'>
                    <div className='line-clamp-1 mpt__row-item--title'>
                        <input
                            value={inputUserName}
                            onChange={(e) => setInputUserName(e.target.value)}
                            readOnly={!isEditing}
                            className='w-full bg-transparent'
                        />
                    </div>
                    <div className='line-clamp-1 mpt__row-item--title'>
                        <input
                            type='email'
                            value={inputEmail}
                            className='w-full bg-transparent'
                            onChange={(e) => setInputEmail(e.target.value)}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>
            </div>
            <div className="mpt__row-item w-1/6">
                <select className='mpt__item-select bg-transparent' value={selectedEmail} onChange={(e) => setSelectedEmail(e.target.value)} disabled={!isEditing}>
                    <option value={1}>Confirmed</option>
                    <option value={0}>UnConfirm</option>
                </select>
            </div>
            <div className="mpt__row-item w-1/6">
                <MaskedInput
                    mask={dateMask}
                    placeholder="MM/dd/yyyy"
                    value={inputDate}
                    readOnly={!isEditing}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="bg-transparent"
                />
            </div>
            <div className="mpt__row-item w-1/6">
                <MaskedInput
                    mask={phoneMask}
                    placeholder="0123456789"
                    readOnly={!isEditing}
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    className="bg-transparent"
                />
            </div>
            <div className="mpt__row-item w-1/12 !p-0">
                <select className='mpt__item-select bg-transparent' value={selectedLock} onChange={(e) => setSelectedLock(e.target.value)} disabled={!isEditing}>
                    <option value={0}>Open</option>
                    <option value={1}>Locked</option>
                </select>
            </div>
            <div className="mpt__row-item w-1/6 line-clamp-2 !px-[10px] !py-0">
                <textarea
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    rows={2}
                    className='mpt__item-address line-clamp-2 bg-transparent'
                    readOnly={!isEditing}
                />
            </div>
            <div className="mpt__row-item w-1/12 flex items-center !p-0">
                <button className='mpt__item--btn' onClick={handleEditClick}>
                    {
                        !isEditing ?
                            <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[30px] p-[3px]' />
                            :
                            <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[30px] p-[2px]' />
                    }
                </button>
                <button className='mpt__item--btn' onClick={handleChangePassword}>
                    <img src={IMG_URL_BASE + "password-icon.svg"} className='w-[30px] p-[3px]' />
                </button>

                <button className='mpt__item--btn' onClick={handleRemoveClick}>
                    <img src={IMG_URL_BASE + "close.svg"} className='w-[30px] p-[3px]' />
                </button>
            </div>

            {isShow && <PasswordChangeItem userId={data.userId} onShowPasswordBroad={setIsShow} />}
            {isLoading && <LoaderPage/>}
        </div>
    )
}

function PasswordChangeItem({ userId, onShowPasswordBroad }) {
    const inputRef = useRef(null);

    const handleChangePassword = async () => {
        try {
            const response = await appClient.patch(`api/admin/users/${userId}/password`, inputRef.current.value, {
                headers: {
                    "Content-Type": 'application/json',
                },
            });

            const data = response.data;
            if (data.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Password changed successfully",
                    duration: 4000
                });

                onShowPasswordBroad(false);
            }
            else {
                toast({
                    type: "error",
                    title: "Error",
                    message: "Password changed failed",
                    duration: 4000
                });

                onShowPasswordBroad(false);
            }
        }
        catch {

        }
    }


    return (
        <div className='fixed top-0 left-0 w-full flex justify-center items-center h-screen pci__wrapper z-[1000]' onClick={(e) => onShowPasswordBroad(false)}>
            <div className='w-[400px] h-[300px] p-[20px] justify-between bg-white flex flex-col items-center rounded-[10px]' onClick={(e) => e.stopPropagation()} >
                <div className='pci__title'>Change Password</div>
                <input className='pci__input' placeholder='Enter new password ...' type="password" ref={inputRef} />
                <button className='pci__btn' onClick={handleChangePassword}>Apply Change</button>
            </div>
        </div>
    )
}

export default MemberPage