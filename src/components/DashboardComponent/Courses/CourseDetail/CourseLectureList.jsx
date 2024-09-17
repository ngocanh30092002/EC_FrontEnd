import React, { useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';

function CourseLectureList({contents}) {
    var count = 1;
    var newContents = contents.map((item) =>{
        return {
            ...item,
            assignments: item.assignments.map((assign) =>{
                return {
                    ...assign,
                    noNumRender: count++
                };
            })
        };
    })

    return (
        <div className='cli__wrapper mt-[20px]'>
            {newContents.map((item,index) => 
                <CourseLectureItem
                    content ={item} 
                    index={index} 
                    key={index}
                />
            )}
        </div>
    )
}

function CourseLectureItem({content, index}){
    const [isOpen, setOpen] = useState(false);
    const assignments = content.assignments;
   

    const handleOpenSubContent = () =>{
        setOpen(!isOpen);
    }
    return (
        <div className='cli__course--content'>
            <div className="cli__title--wrapper"  onClick={handleOpenSubContent}>
                <div className='flex items-center'>
                    {isOpen ?
                        <img className='w-[16px]' src={IMG_URL_BASE + "minus-icon.svg"}/>
                        :
                        <img className='w-[18px]' src={IMG_URL_BASE + "plus-icon.svg"}/>
                    }
                    <span className='ml-[10px] cli__title'>{index+1}. {content.title}</span>
                </div>

                <div className='cli__title--total'>{assignments.length} Lessons</div>
            </div>
            {
                isOpen 
                && 
                <ul className='cli__list'>
                    {assignments.map((item,index)=>
                        <li className='cli__item' key={index}>
                            <div className='flex-1'>
                                <img className='cli__item--img'/>
                                <div className='cli__item--title'>
                                    <div className='min-w-[20px] text-left'>{item.noNumRender}.</div>
                                    <div className='ml-[10px]'>{item.title}</div>
                                </div>
                            </div>
                            <span className='cli__item--time'>{item.time}</span>
                        </li>
                    )}
                </ul>
            }
        </div>
    )
}

export default CourseLectureList