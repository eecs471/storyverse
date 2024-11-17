import { Navbar } from "../Navbar"
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../config/firebase"
import { getDoc, doc, deleteDoc, updateDoc,arrayUnion } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import {  Box, Text, VStack ,Button, Flex, Input, Spinner } from '@chakra-ui/react'
import "./Grammar.css"
import axios from "axios"
import { GrammarQuiz, QuizQuestionList } from "./GrammarQuiz";
import { Leaderboard } from "./Leaderboard";
import { Gamification } from "./Gamification";
import { GrammarQuizList } from "./GrammarHistory";
import './Gamification.css';

export const Grammar = () => {
    const [userData, setUserData] = useState<any>(null);
    const [quizContent, setQuizContent] = useState<QuizQuestionList>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const backend_api = "http://localhost:8000";
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);

    // Fetch quizzes from Firestore
    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!auth.currentUser) {
                console.error("User not logged in");
                return;
            }
            try {
                const userDbRef = doc(db, "users", auth.currentUser.email as string);
                const docSnap = await getDoc(userDbRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setQuizzes(data.grammarquizResults || []);
                }
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        };

        fetchQuizzes();
    }, []);
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
                  {/* {selectedQuiz ?  */}

                    {/* // <GrammarQuizList quizzes={quizzes} first_sel={selectedQuiz} /> */}
                    {selectedQuiz ? (
                        // 如果有 selectedQuiz，渲染 GrammarQuizList
                        <GrammarQuizList quizzes={quizzes} first_sel={selectedQuiz} />
                        ) :
                    quizContent ? 
                    <div className="quiz">
                        <GrammarQuiz quiz={quizContent.quiz} correctAnswers={quizContent.correctAnswers}/> 
                    </div>
                    : 
                    <>
                    <div className="grammar-history">
                        <strong>
                        Grammar History
                        </strong>
                        <Flex>
                            {/* Left Column */}

                                <VStack spacing={3} align="stretch">\
                                    {quizzes.map((quiz, index) => (
                                        <Box
                                            key={index}
                                            p={3}
                                            border="1px solid #ccc"
                                            borderRadius="md"
                                            cursor="pointer"
                                            onClick={() => {
                                                setSelectedQuiz(quiz);
                                            }}
                                            _hover={{ backgroundColor: "gray.100" }}
                                        >
                                            <Text fontWeight="bold">Grammar Test {index + 1}</Text>
                                            <Text>Accuracy: {quiz.percentCorrect.toFixed(2)}%</Text>
                                        </Box>
                                    ))}
                                </VStack>

                        </Flex>
                    </div>
                    <div className="dashboard-actions">
                    <Gamification />
                    <Button 
                        onClick={generate}
                        isLoading={isLoading}
                        loadingText="Generating..."> 
                        Generate Grammar Quiz 
                    </Button>
                    </div>


                    <Leaderboard />
                    </>
                    }
                    
                </div>
            </div>
        </>
    )
}