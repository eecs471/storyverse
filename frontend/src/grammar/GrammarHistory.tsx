import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db,storageBucket,storage } from "../config/firebase";
import { Box, Flex, Text, Button, VStack, Divider,Image } from '@chakra-ui/react';
import { Navbar } from "../Navbar";
import { getDownloadURL, ref } from "firebase/storage";
import { Grammar } from "./Grammar"
import { Link, useNavigate } from 'react-router-dom';

import { GrammarQuiz, QuizQuestionList } from "./GrammarQuiz";
import "./Grammar.css"
import axios from "axios"
interface QuizImageProps {
    imagePath: string; // 文件的路径，例如：quiz_images/.../image.jpg
  }
    

  const QuizImage: React.FC<QuizImageProps> = ({ imagePath }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchImage = async () => {
        const imageRef = ref(storage, imagePath);
  
        try {
          const url = await getDownloadURL(imageRef);
          setImageUrl(url);
        } catch (error) {
          console.error("Error fetching image URL:", error);
        }
      };
  
      fetchImage();
    }, [imagePath]); // 当路径变化时重新加载图片
  
    return (
      <div className="image">
        {imageUrl ? (
            
          <Image src={imageUrl} alt="Image Loading Failed"/>
        ) : (
          <p>Loading image...</p>
        )}
      </div>
    );
  };
export const GrammarQuizList = () => {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null); // State to track the displayed component
    const [quizContent, setQuizContent] = useState<QuizQuestionList>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>(null);
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

    // Simulate grading logic


    return (
        <>
        <Navbar />
            {/* Left Column */}

                {/* <Text fontSize="xl" fontWeight="bold" mb={4}>
                    Your Grammar Quizzes
                </Text> */}
            <Flex flexDirection="row" width="90%">
            
                <VStack spacing={3} align="stretch" overflow="auto">
                <Box 
                            p={3}
                            bg="blue.300" // Ensure a default background color is set

                            border="1px solid #ccc"
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => {
                                setSelectedComponent("Grammar"); // Set the selected component to Grammar
                                generate();
                                setSelectedQuiz(null); // Clear any selected quiz
                            }}
                            _hover={{ backgroundColor: "blue.500", color: "white" }}
                            >                            
                        <Text fontWeight="bold">New Quiz</Text>
                        </Box>
                    {quizzes.map((quiz, index) => (
                        <Box
                            key={index}
                            p={3}
                            border="1px solid #ccc"
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => {
                                setSelectedQuiz(quiz);
                                setSelectedComponent(null); // Ensure Grammar is not shown
                            }}
                            _hover={{ backgroundColor: "gray.100" }}
                        >
                            <Text fontWeight="bold">Grammar Test {index + 1}</Text>
                            <Text>Accuracy: {quiz.percentCorrect.toFixed(2)}%</Text>
                        </Box>
                    ))}
                </VStack>
            {/* Main Area */}
            <Box width="75%" p={4} overflow="auto">
            {selectedComponent === "Grammar" ? (
                quizContent&&~isLoading ? 
                <div className="quiz">
                    <GrammarQuiz quiz={quizContent.quiz} correctAnswers={quizContent.correctAnswers}/> 
                </div>:
                <div>
                    Generating
                </div>
                
                ) :selectedQuiz ? (
                    <>
                        <Text fontSize="2xl" fontWeight="bold" mb={4}>
                            Quiz Details
                        </Text> 
                        <VStack align="stretch" spacing={4}>
                        {selectedQuiz.questions.map((q: any, index: number) => (
                                <>
                                {q.userAnswer === q.correctAnswer && <span className="correct">✔️</span>}
                                {q.userAnswer !== q.correctAnswer && <span className="incorrect">❌</span>}
                                <div className="image">
                                <QuizImage imagePath={q.image} />
                                </div>

                                <strong>{q.question}</strong>
                                {q.answerChoices.map((answerChoice: string[], index: number) => (
                                    <div className="multiple-choice-option">
                                        <input 
                                            type="radio"
                                            name={q.question}
                                            value={answerChoice}
                                            checked={index === q.userAnswer}
                                            onChange={() => {return;}}
                                            disabled={true}
                                        />
                                        <label> {answerChoice} </label>
                                        {q.userAnswer !== q.correctAnswer && index === q.correctAnswer && <span className="correct">✔️</span>}
                                    </div>
                                ))}
                                <br />
                            </>
                            ))}
                        </VStack>
                    </>
                ) : (
                    <Text>Select a quiz from the left to view its details.</Text>
                )}
            </Box>
            </Flex>

        </>
    );
};
