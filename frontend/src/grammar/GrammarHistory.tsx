import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db,storageBucket,storage } from "../config/firebase";
import { Box, Flex, Text, Button, VStack, Divider,Image } from '@chakra-ui/react';
import { Navbar } from "../Navbar";
import { getDownloadURL, ref } from "firebase/storage";
type Quiz = {
    percentCorrect: number; // 每个 quiz 至少有这个属性
    [key: string]: any; // 如果 quiz 对象可能包含其他动态键值
  };

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
  export const GrammarQuizList: React.FC<{ quizzes: Quiz[],first_sel:Quiz }> = ({ quizzes,first_sel }) => {
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(first_sel); // 初始化为 first_sel



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
                                <div className="image">
                                <QuizImage imagePath={q.image} />
                                </div>
                                <div className="question-text"> 
                                    {q.userAnswer === q.correctAnswer && <span className="correct">✔️</span>}
                                    {q.userAnswer !== q.correctAnswer && <span className="incorrect">❌</span>}
                                    <strong>{q.question}</strong>
                                </div>
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
