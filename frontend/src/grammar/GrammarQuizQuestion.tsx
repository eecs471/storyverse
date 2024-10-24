import React from "react";
import { useState } from "react"
import { Button, Input } from '@chakra-ui/react'

export interface QuizQuestion {
    questionIndex: number;
    question: string;
    answerChoices: string[];
    selectedAnswer: number;
    setAnswerSelections: React.Dispatch<React.SetStateAction<number[]>>;
    correctAnswer: number;
    graded: boolean;
}

export const GrammarQuizQuestion: React.FC<QuizQuestion> = ({questionIndex, question, answerChoices,  selectedAnswer, setAnswerSelections, correctAnswer, graded}) => {
    
    const changeAnswer = (index: number) => {
        setAnswerSelections((prevAnswers) => {
            const newAnswers = [...prevAnswers];
            newAnswers[questionIndex] = index;
            return newAnswers;
        });
    }

    return (
        <>
            
            {graded && selectedAnswer === correctAnswer && <span className="correct">✔️</span>}
            {graded && selectedAnswer !== correctAnswer && <span className="incorrect">❌</span>}
            <strong>{question}</strong>
            {answerChoices.map((answerChoice, index) => (
                <div className="multiple-choice-option">
                    <input 
                        type="radio"
                        name={question}
                        value={answerChoice}
                        checked={index === selectedAnswer}
                        onChange={() => changeAnswer(index)}
                        disabled={graded}
                    />
                    <label> {answerChoice} </label>
                    {graded && selectedAnswer !== correctAnswer && index === correctAnswer && <span className="correct">✔️</span>}
                </div>
            ))}
            <br />
        </>
    )
}