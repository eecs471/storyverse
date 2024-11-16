import { Navbar } from "../Navbar"
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../config/firebase"
import { getDoc, doc, deleteDoc, updateDoc,arrayUnion } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Button, Input, Spinner } from '@chakra-ui/react'
import "./Grammar.css"
import axios from "axios"
import { GrammarQuiz, QuizQuestionList } from "./GrammarQuiz";
import { Leaderboard } from "./Leaderboard";

export const Grammar = () => {
    const [userData, setUserData] = useState<any>(null);
    const [quizContent, setQuizContent] = useState<QuizQuestionList>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        try {
            setIsLoading(true);
            const payload = {age: userData.age, interests: userData.interests};
            const response = await axios.post(backend_api + "/grammar", payload);
            const responseData = response.data;
            setQuizContent(responseData);
            setIsLoading(false);
        } catch(err) {
            console.error(err);
        }
        
    }
    const goToGrammarQuizzes = () => {
        navigate('/grammar-quizzes');
    };
    
    return (
        <>
            <Navbar />
            <div className="grammar">
                <strong>Grammar Dashboard</strong>
                <div className="grammar-dashboard">
                    {quizContent ? 
                    <div className="quiz">
                        <GrammarQuiz quiz={quizContent.quiz} correctAnswers={quizContent.correctAnswers}/> 
                    </div>
                    : 
                    <>
                    <Button onClick={goToGrammarQuizzes} colorScheme="teal" mt={4}>
                        Go to Your Grammar Quizzes
                    </Button>

                    <Button 
                        onClick={generate}
                        isLoading={isLoading}
                        loadingText="Generating..."> 
                        Generate Grammar Quiz 
                    </Button>

                    <Leaderboard />
                    </>
                    }
                </div>
            </div>
        </>
    )
}