import React, { ReactNode } from "react";
import { GrammarQuizQuestion, QuizQuestion } from "./GrammarQuizQuestion"
import { Button, Input } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { AiChat, useAsBatchAdapter, ChatAdapterExtras } from '@nlux/react';
import '@nlux/themes/nova.css'

export interface QuizQuestionList {
    quiz: QuizQuestion[];
    correctAnswers: number[];
}

export const GrammarQuiz: React.FC<QuizQuestionList> = ({quiz, correctAnswers}) => {
    const [answerSelections, setAnswerSelections] = useState<number[]>(new Array(quiz.length).fill(-1));
    const [score, setScore] = useState<number>(-1);
    const [graded, setGraded] = useState<boolean>(false);

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
                        correctAnswers: correctAnswers
                        })
                })
                return await response.text()
            } catch (err) {
                console.error(err);
                return "Grammar Chat Api Failure";
            }
        }
    );

    const submitQuiz = () => {
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