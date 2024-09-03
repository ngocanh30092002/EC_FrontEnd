import { GetCookie } from '@/helper/CookiesHelper';
import toast from '@/helper/Toast';
import * as signalR from '@microsoft/signalr';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ACCESS_TOKEN, APP_API, REFRESH_TOKEN } from '~/GlobalConstant';
import NoNotification from './NoNotification';
import NotificationItem from './NotificationItem';
import TokenHelpers from '@/helper/TokenHelper';
import { appClient } from '~/AppConfigs';

function NotificationBoard({imgUrlBase}){
    const [isShowBoard, setShowBoard] = useState(false);
    const [isReadAll, setReadAll] = useState(false);
    const [notiData , setNotiData] = useState([])
    const [notiConnection, setNotiConnection] = useState(null);
    // SignalR listening notification
    useLayoutEffect(() => {
        const getNotifications = async () =>{
            try{
                var response = await appClient.get("api/Notification/get-all-notifications");
                var data = response.data;
                setNotiData(data);
                console.log(data);
            }
            catch(error){
                toast({
                    type: "error",
                    duration: 5000,
                    title: "Error",
                    message: error.message
                })
            }
        }
        getNotifications();
    }, [])

    useEffect(() =>{
        const notiConnection = new signalR.HubConnectionBuilder()
            .withUrl(APP_API + "noti", {
                accessTokenFactory: () => {
                    GetCookie(ACCESS_TOKEN);
                }
            })
            // .configureLogging(signalR.LogLevel.Error)
            .withAutomaticReconnect()
            .build();

        setNotiConnection();

        if (notiConnection) {
            const startConnection = (isFirstTime) =>{
                notiConnection.start()
                .catch(e => {
                    const handleError = async () =>{
                        var errorMessage = e.message;
                        if(errorMessage.includes("401") && isFirstTime){
                            var accessToken = GetCookie(ACCESS_TOKEN);
                            var refreshToken = GetCookie(REFRESH_TOKEN);
                            if(TokenHelpers.IsExpired(accessToken,refreshToken)){
                                await TokenHelpers.Renew(accessToken, refreshToken, false);
                            }

                            startConnection(false);
                        }
                        else{
                            toast({
                                type: "error",
                                duration: 5000, 
                                title: "SignalR Connection Error",
                                message: errorMessage
                            });
                        }
                    }

                    setTimeout(handleError,1000);
                });
            }

            startConnection(true);
        }

        notiConnection.on("ReceiveError", (errorMessage) =>{
            toast({
                type: "error",
                duration: 5000,
                message: errorMessage,
                title: "SignalR Server Error"
            })
        });

        notiConnection.on("ReceiveNotification", (notiModel) =>{
            setNotiData(prev => {
                return [JSON.parse(notiModel), ...prev];
            });
        });

        return()=>{
            if(notiConnection){
                notiConnection.stop().catch(e => {
                    toast({
                        type: "error",
                        duration: 5000,
                        title: "SignalR Connection Error",
                        message: e.message
                    })
                });
            }
        }
    }, [])

   

    useEffect(() =>{
        setReadAll(notiData.every(e => e.IsRead))
    }, [notiData])

    const handleShowNotify = (e) =>{
        setShowBoard(!isShowBoard);
    }

    const handleMarkReadAll = () =>{
        setNotiData(preData => preData.map(item => {
            item.IsRead = true
            return item;
        }));

        setReadAll(true);
        appClient.patch("api/Notification/mark-read-all")
    }

    const handleMarkRead = (notiId) =>{
        setNotiData(preNotiData =>{
            var newNotiData = preNotiData.map((item,index) =>{
                if(item.notiId == notiId){
                    item.isRead = true
                }

                return item;
            })

            return newNotiData;
        })

        setShowBoard(false);
    }


    return (
        <>
            <div className={`noti__item last 
                ${isShowBoard ? "active" : ""} 
                ${isReadAll ? "" : "hasNoti" }`} 
                onClick={(e) => handleShowNotify(e)}>

                <img src={imgUrlBase + "alert_bell1.svg"} alt="" className="w-[24px] noti__item--img"/>

                <div className='noti__list-info flex flex-col' onClick={(e) => e.stopPropagation()}>
                    <div className='nli__header flex justify-between items-center overflow-hidden'>
                        <span className='nli__header--title'>Notifications</span>
                        <button className='nli__header--mark' onClick={handleMarkReadAll}>Mark all</button>
                    </div>

                    <div className='h-full'>
                        {notiData.map((item, index) =>{
                            return <NotificationItem key={index} itemInfo ={item} onMarkNoti = {handleMarkRead}/>
                        })}

                        {notiData.length == 0 && <NoNotification />}
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotificationBoard