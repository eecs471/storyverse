import React, { ReactNode } from "react";
import { GrammarQuizQuestion, QuizQuestion } from "./GrammarQuizQuestion"
import { Button, Input } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { AiChat, useAsBatchAdapter, ChatAdapterExtras, ChatItem } from '@nlux/react';
import '@nlux/themes/nova.css'
import { getDoc, doc, deleteDoc, updateDoc,arrayUnion } from 'firebase/firestore';
import { auth, db,storage } from "../config/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import necessary Firebase Storage functions


export interface QuizQuestionList {
    quiz: QuizQuestion[];
    correctAnswers: number[];
}

export const GrammarQuiz: React.FC<QuizQuestionList> = ({quiz, correctAnswers}) => {
    const [answerSelections, setAnswerSelections] = useState<number[]>(new Array(quiz.length).fill(-1));
    const [score, setScore] = useState<number>(-1);
    const [graded, setGraded] = useState<boolean>(false);
    const chatHistoryRef = useRef<string[]>([]);

    const gptAdapter = useAsBatchAdapter(
        async (message: string, extras: ChatAdapterExtras): Promise<string> => {
            const quizPayload = quiz.map((quizQuestion) => {
                return {question: quizQuestion.question, answerChoices: quizQuestion.answerChoices}
            });
            
            try {
                const response = await fetch('http://localhost:8000/grammarchatapi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userPrompt: message, 
                        quiz: quizPayload,
                        userAnswers: answerSelections,
                        correctAnswers: correctAnswers,
                        history: chatHistoryRef.current,
                    }),
                });
                const textResponse = await response.text();
                chatHistoryRef.current = [...chatHistoryRef.current, message, textResponse]
                return textResponse;

            } catch (err) {
                console.error(err);
                return "Grammar Chat Api Failure";
            }
        }
    );
    const sanitizeString = (str:string) =>
        str.replace(/[^\w\s]/g, "").replace(/\s+/g, "_");
    const base64ToBlob = (base64String:string, contentType:string) => {
        const base64Data = base64String.includes("base64,")
          ? base64String.split(",")[1] // Extract Base64 content if prefixed with `data:image/...`
          : base64String;
      
        const byteCharacters = atob(base64Data); // Decode Base64 string
        const byteNumbers = new Uint8Array(byteCharacters.length);
      
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
      
        return new Blob([byteNumbers], { type: contentType });
      };
    const submitQuiz = async() => {
        const allQuestionsAnswered = !answerSelections.includes(-1);

        if (allQuestionsAnswered) {
            let numCorrect = 0;
            for (let i = 0; i < answerSelections.length; i++) {
                if (answerSelections[i] === correctAnswers[i]) {
                    numCorrect++;
                }
            }
            const percentCorrect = (numCorrect / answerSelections.length) * 100;
            setScore(percentCorrect);
            const quizResult = {
                timestamp: new Date().toISOString(), // 提交时间
                percentCorrect, // 正确率
                questions: await Promise.all( // Ensure all images are uploaded before saving
                    quiz.map(async (q, index) => {
                        let filePath = null;
            
                        if (q.image) {
                            // Upload the image to Firebase Storage
                            const sanitizedQuestion = sanitizeString(q.question);

                            const blob = base64ToBlob(q.image, "image/png"); // Convert Base64 string to Blob
                            filePath = `quiz_images/${auth.currentUser?.uid}/${sanitizedQuestion}_${index}`;
                            console.log("File path:", filePath);
                            console.log("Blob size:", blob.size);
                            console.log("Blob type:", blob.type);

                            const storageRef = ref(
                              storage,
                              filePath
                            );
                            try {
                                const snapshot = await uploadBytes(storageRef, blob);
                                console.log("File uploaded successfully:", snapshot.metadata.fullPath);
                              } catch (error) {
                                if (error instanceof Error) {
                                    console.error("Error during upload:", error.message);
                                  } else {
                                    console.error("Unexpected error during upload:", error);
                                  }                              }
                        }
            
                        return {
                            question: q.question, // 每个问题的文本
                            answerChoices: q.answerChoices,
                            correctAnswer: correctAnswers[index], // 每个问题的正确答案
                            userAnswer: answerSelections[index], // 用户提交的答案
                            image: filePath, // Store the image URL
                        };
                    })
                ),
            };
    
            // 保存到 Firestore
            try {
                const userDbRef = doc(db, "users", auth.currentUser?.email as string);
                const userData = await getDoc(userDbRef);
                let numGrammarQuestionsAnsweredCorrectly = numCorrect;

                if (userData?.data()?.grammarQuestionsAnsweredCorrectly) {
                    numGrammarQuestionsAnsweredCorrectly += userData?.data()?.grammarQuestionsAnsweredCorrectly;
                }

    
                await updateDoc(userDbRef, {
                    grammarquizResults: arrayUnion(quizResult), // 添加结果到 grammarquizResults 数组
                    grammarQuestionsAnsweredCorrectly: numGrammarQuestionsAnsweredCorrectly,
                });

    
                console.log("Quiz results saved successfully!");
            } catch (err) {
                console.error("Error saving quiz results:", err);
            }
            setGraded(true);
        } else {
            alert("Please Select an Answer Choice for all Questions!");
        }
    }

    return (
        <>
            {quiz.map((quizQuestion, index) => (
                <GrammarQuizQuestion 
                    key={index} 
                    questionIndex={index}
                    question={quizQuestion.question} 
                    answerChoices={quizQuestion.answerChoices} 
                    selectedAnswer={answerSelections[index]} 
                    setAnswerSelections={setAnswerSelections} 
                    correctAnswer={correctAnswers[index]}
                    graded={graded}
                    image={quizQuestion.image}
                />
            ))}
            {graded 
            ? 
            <>
                <strong>Score: {score}% </strong>
                <AiChat
                    adapter={gptAdapter}
                    composerOptions={{
                        placeholder: 'Have any questions?'
                    }}
                    conversationOptions={{
                        historyPayloadSize: 'max'
                    }}
                />
            </>
            : <Button onClick={submitQuiz}> Submit </Button>}

        </>
    )
}