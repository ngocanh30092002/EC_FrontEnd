import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionImage from './QuestionImage';
import QuestionAudio from './QuestionAudio';
import QuestionSentence from './QuestionSentence';
import QuestionConversation from './QuestionConversation';
import QuestionSingle from './QuestionSingle';
import QuestionRcConversation from './QuestionRcConversation';

function QuestionAddBoard() {
    const { type } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!type) {
            return navigate(-1);
        }
    }, [])
    return (
        <>
            {type == "Image" && <QuestionImage />}
            {type == "Audio" && <QuestionAudio />}
            {type == "Conversation" && <QuestionConversation />}
            {type == "Sentence" && <QuestionSentence />}
            {type == "Single" && <QuestionSingle />}
            {type == "Double" && <QuestionRcConversation />}
            {type == "Triple" && <QuestionRcConversation isDouble={false}/>}
        </>
    )
}

export default QuestionAddBoard