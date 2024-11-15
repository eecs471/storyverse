import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db,storageBucket,storage } from "../config/firebase";
import { Box, Flex, Text, Button, VStack, Divider,Image } from '@chakra-ui/react';
import { Navbar } from "../Navbar";
import { getDownloadURL, ref } from "firebase/storage";

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
    const [graded, setGraded] = useState(false); // Track grading state
    const [score, setScore] = useState<number | null>(null); // Track score for the selected quiz

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
        <Flex>
            {/* Left Column */}

            <Navbar />
            <Box width="25%" borderRight="1px solid #ccc" p={4}>
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                    Your Grammar Quizzes
                </Text>
                <VStack spacing={3} align="stretch">
                    {quizzes.map((quiz, index) => (
                        <Box
                            key={index}
                            p={3}
                            border="1px solid #ccc"
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => {
                                setSelectedQuiz(quiz);
                                setGraded(false); // Reset grading state
                                setScore(null); // Reset score
                            }}
                            _hover={{ backgroundColor: "gray.100" }}
                        >
                            <Text fontWeight="bold">Grammar Test {index + 1}</Text>
                            <Text>Accuracy: {quiz.percentCorrect.toFixed(2)}%</Text>
                        </Box>
                    ))}
                </VStack>
            </Box>

            {/* Main Area */}
            <Box width="75%" p={4}>
                {selectedQuiz ? (
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
    );
};
