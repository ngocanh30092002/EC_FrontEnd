import React, { useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { APP_API, ACCESS_TOKEN } from '~/GlobalConstant';
import { GetCookie } from './../../../helper/CookiesHelper';

function BookmarksPage() {
    const [connection, setConnection] = useState(null);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);

    useEffect(() => {
        // Tạo kết nối với SignalR Hub
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(APP_API + "noti", {accessTokenFactory: () => GetCookie(ACCESS_TOKEN)})
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        // Lắng nghe tin nhắn từ server
        newConnection.on("ReceiveMessage", (groupName, message) => {
            alert(groupName  + message);
        });


        
        newConnection.on("SendNotiToGroup", (model) =>{
            console.log(model);
        })
        newConnection.start()
            .catch(error => console.error("SignalR Connection Error: ", error));

    }, []);

    const sendMessage = () => {
        const sendToUser =  async () =>{
            if (connection) {
                try {
                    await connection.invoke("SendMessage", "CLASS_1", message);
                    setMessage("");
                } catch (error) {
                    console.error("Send Message Error: ", error);
                }
            }
        }
        sendToUser();
    };

    const joinGroup = () =>{
        const invokeJoinGroup = async () =>{
            if (connection) {
                try {
                    await connection.invoke("JoinGroup", "CLASS_1");
                } catch (error) {
                    console.error("Send Message Error: ", error);
                }
            }
        }

        invokeJoinGroup();
    }

    const leaveGroup = () =>{
        const invokeLeaveGroup = async () =>{
            if (connection) {
                try {
                    await connection.invoke("LeaveGroup", "CLASS_1");
                } catch (error) {
                    console.error("Send Message Error: ", error);
                }
            }
        }

        invokeLeaveGroup();
    }

    const sendNoti = () =>{
        const invokeSendNotiToGroup = async () =>{
            const notiModel = {
                Title: "New Message",
                Description: "You have a new notification!",
                Time: new Date().toISOString() 
            };

            if (connection) {
                try {
                    await connection.invoke("SendNotiToGroup", "CLASS_1", notiModel);
                } catch (error) {
                    console.error("Send Message Error: ", error);
                }
            }
        }

        invokeSendNotiToGroup();
    }

    return (
        <div >
            <button onClick={sendMessage}>Click to send message</button>
            <button onClick = {joinGroup}>Click to Join Group</button>
            <button onClick = {leaveGroup}>Click to Leave Group</button>
            <button onClick = {sendNoti}>Click to send noti</button>
        </div>
    );
}

export default BookmarksPage