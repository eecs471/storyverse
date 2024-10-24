import { Navbar } from "../Navbar"
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../config/firebase"
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Button, Input } from '@chakra-ui/react'
import "./Grammar.css"
import axios from "axios"
import { GrammarQuiz, QuizQuestionList } from "./GrammarQuiz";

export const Grammar = () => {
    const [userData, setUserData] = useState<any>(null);
    const [quizContent, setQuizContent] = useState<QuizQuestionList>();

    const navigate = useNavigate();
    const backend_api = "http://localhost:8000";

    useEffect(() => {
        // Ensure user is logged in before rendering
        if (!auth?.currentUser) {
            navigate('/login');
        } 

        const fetchUserData = async () => {
            try {
                const userDbRef = doc(db, "users", auth.currentUser?.email as string);
                const response = await getDoc(userDbRef);
                const responseData = {
                    ...response.data(),
                    email: response.id
                }
                setUserData(responseData);
            }
            catch (err) {
                console.error(err);
            }
        }

        fetchUserData();
    }, []);

    const generate = async () => {
        const payload = {age: userData.age, interests: userData.interests};
        const response = await axios.post(backend_api + "/grammar", payload);
        const responseData = response.data;
        setQuizContent(responseData);
    }

    return (
        <>
            <Navbar />
            <div className="grammar-quiz">
                <strong>Grammar Quiz</strong>
                <br />
                <br />
                {quizContent ? 
                <div className="quiz">
                    <GrammarQuiz quiz={quizContent.quiz} correctAnswers={quizContent.correctAnswers}/> 
                </div>
                : <Button onClick={generate}> Generate Grammar Quiz </Button>}
            </div>
        </>
    )
}