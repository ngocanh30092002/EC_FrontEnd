import React, { useEffect, useRef, useState } from 'react'
import { appClient } from '~/AppConfigs';
import DropDownList from '../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';

function AddReportBoard({ isShow, onShow, onReloadReport}) {
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [indexType, setIndexType] = useState(0);

    const inputTitleRef = useRef(null);
    const inputDesRef = useRef(null);

    const getIssueTypes = async () => {
        try {
            let response = await appClient.get("api/IssueReports/type");
            let dataRes = response.data;
            if (dataRes.success) {
                setTypes(dataRes.message);
                setSelectedType(dataRes.message[0]);
                setIndexType(0);
            }
        }
        catch {

        }
    }

    const handleSelectedType = (item, index) => {
        setSelectedType(item);
        setIndexType(index);
    }

    useEffect(() => {
        getIssueTypes();
    }, [])

    const handleClearInput = ()=>{
        setIndexType(0);
        inputDesRef.current.value = "";
        inputTitleRef.current.value = "";
    }

    const handleSubmitReport = async (event) => {
        event.preventDefault();

        if (inputTitleRef.current && (inputTitleRef.current.value == "" || inputTitleRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Title is required",
                duration: 4000
            });

            inputTitleRef.current.focus();
            inputTitleRef.current.classList.toggle("irp__error");

            setTimeout(() => {
                inputTitleRef.current.classList.toggle("irp__error");
            }, 2000);
            return;
        }

        if(selectedType == null){
            toast({
                type: "error",
                title: "ERROR",
                message: "Type is required",
                duration: 4000
            });
            return;
        }

        try{
            var formData = new FormData(event.target);
            formData.append("Type", selectedType.value);

            const response = await appClient.post("api/IssueReports", formData);
            const dataRes = response.data;

            if(dataRes.success){
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Send report successfully",
                    duration: 4000
                });

                handleClearInput();
                onShow(false);
                onReloadReport();
            }
        }
        catch{

        }
    }

    return (
        <form onSubmit={handleSubmitReport} className={`w-full  mt-[20px] irp__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <div className='flex items-center overflow-visible'>
                <div className="flex flex-1 items-center">
                    <div className="arb__title--text">Title</div>
                    <input name='Title' ref={inputTitleRef} className='arb__input' />
                </div>

                <div className="flex flex-1 items-center overflow-visible ml-[20px]">
                    <div className="arb__title--text">Type</div>
                    <DropDownList
                        data={types}
                        className={"arb__input"}
                        onSelectedItem={handleSelectedType}
                        defaultIndex={indexType} />
                </div>
            </div>

            <div className='flex items-start mt-[20px]'>
                <div className="arb__title--text">Description</div>
                <textarea rows={4} name='Description' ref={inputDesRef} className='arb__input resize-none' />
            </div>

            <div className='flex justify-end mt-[20px]'>
                <button className='irp__btn-add' type='submit'>
                    Submit Report
                </button>
            </div>
        </form>
    )
}

export default AddReportBoard