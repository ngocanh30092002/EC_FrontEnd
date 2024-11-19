// import React, { useState } from 'react';

// function HomeworkPage() {
//     const [message, setMessages] = useState([]);
//     const [connection, setConnection] = useState(null);

//     // useEffect(() =>{
//     //     const getMessages = () =>{
//     //         appClient.get("api/chats?receiverId=95ede42f-3031-4732-8d4d-7d9bd25b4dd3")
//     //         .then(res => res.data)
//     //         .then(data =>{
//     //             if(data.success){
//     //                 setMessages(data.message);
//     //             }
//     //         })
//     //     }

//     //     getMessages();
//     // },[])

//     // useEffect(() => {
//     //     // Kết nối với SignalR Hub
//     //     const connection = new signalR.HubConnectionBuilder()
//     //         .withUrl("https://localhost:44314/api/hub/chats", {
//     //             withCredentials: true
//     //         })
//     //         .withAutomaticReconnect()
//     //         .build();
    
//     //     connection.start()
//     //         .then(() => {
//     //             console.log('Connected to chat hub');
//     //         })
//     //         .catch(err => console.error('Connection failed: ', err));
            
//     //     connection.on("Online", (userId) =>{
//     //         console.log("user online " , userId);
//     //     })

//     //     connection.on("ReceiveMessage", (message) => {
//     //         console.log(message);
//     //     });
    
//     //     setConnection(connection);
//     // }, []);
    
//     // const handleClickSendMessage = () =>{
//     //     connection.invoke("SendMessage", {
//     //         senderId:"da48d296-cf01-4a3f-a167-04aa007ac3c6",
//     //         receiverId: "95ede42f-3031-4732-8d4d-7d9bd25b4dd3",
//     //         message:"hili"
//     //     });
//     // }

//     return (
//         <div className='flex'>
            
//         </div>
//     )
    
// }

// export default HomeworkPage