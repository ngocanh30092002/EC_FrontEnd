import React, { useEffect, useRef, useState } from 'react'
import DropDownList from './../../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';
import { appClient } from '~/AppConfigs';

function ToeicAddBoard({ isShow, onShow, onReloadExams }) {
    const currentYear = new Date().getFullYear();
    const [indexYear, setIndexYear] = useState(0);
    const [selectedYear, setSelectedYear] = useState(null);
    const [years, setYears] = useState(() => {
        const currentYear = new Date().getFullYear();
        const years = [];

        for (let year = currentYear; year > currentYear - 10; year--) {
            years.push(year);
        }

        return years.map((item, index) => ({ key: item, value: item }));
    })

    const inputNameRef = useRef(null);
    const inputCodeRef = useRef(null);

    const handleSelectedYear = (item, index) => {
        setSelectedYear(item);
        setIndexYear(index);
    }

    const handleChangeCode = (event) => {
        if (inputCodeRef.current) {
            inputCodeRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleClearInput = () => {
        inputNameRef.current.value = "";
        inputCodeRef.current.value = "";
        setSelectedYear(years[0]);
        setIndexYear(0);
    }

    const handleSubmitToeic = async (event) => {
        event.preventDefault();
        try {
            if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Name is required",
                    duration: 4000
                });

                inputNameRef.current.classList.toggle("input-error");
                inputNameRef.current.focus();

                setTimeout(() => {
                    inputNameRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }
            if (inputCodeRef.current && (inputCodeRef.current.value == "" || inputCodeRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Code is required",
                    duration: 4000
                });

                inputCodeRef.current.classList.toggle("input-error");
                inputCodeRef.current.focus();

                setTimeout(() => {
                    inputCodeRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            if (!selectedYear) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Year is required",
                    duration: 4000
                });

                return
            }

            const formData = new FormData();
            formData.append("Name", inputNameRef.current.value.toUpperCase());
            formData.append("Code", inputCodeRef.current.value);
            formData.append("Year", selectedYear.key);
            
            const response = await appClient.post("api/ToeicExams", formData);
            const dataRes = response.data;

            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create Toeic successfully",
                    duration: 4000
                });

                handleClearInput();
                onShow(false);
                onReloadExams();
            }
        }
        catch (err) {
            toast({
                type: "error",
                title: "ERROR",
                message: err.message,
                duration: 4000
            });
        }
    }

    useEffect(() => {
        setSelectedYear(0);
        setSelectedYear(years[0]);
    }, [])


    return (
        <div className={`w-full mt-[20px] cab__wrapper  border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <form onSubmit={handleSubmitToeic} className='flex flex-col p-[20px] overflow-visible'>
                <div className="flex items-center">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Name</div>
                        <input
                            name='Name'
                            className='cab__input-text uppercase'
                            ref={inputNameRef}
                        />
                    </div>

                </div>

                <div className='flex items-center mt-[20px] overflow-visible'>
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Code</div>
                        <input
                            name='Code'
                            className='cab__input-text '
                            ref={inputCodeRef}
                            onChange={handleChangeCode}
                        />
                    </div>
                    <div className="flex items-center flex-1 ml-[20px] overflow-visible">
                        <div className='cab__title--text'>Year</div>
                        <DropDownList
                            name='Year'
                            className='cab__input-text'
                            data={years}
                            defaultIndex={indexYear}
                            hideDefault={true}
                            onSelectedItem={handleSelectedYear}
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-[20px]">
                    <button className='cabf__btn--func' type='submit'>
                        Create Toeic
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ToeicAddBoard