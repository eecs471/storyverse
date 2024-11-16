import React from "react";
import { useState } from "react"
import { Button, Input, Image } from '@chakra-ui/react'
import "./GrammarQuizQuestion.css"

export interface QuizQuestion {
    questionIndex: number;
    question: string;
    answerChoices: string[];
    selectedAnswer: number;
    setAnswerSelections: React.Dispatch<React.SetStateAction<number[]>>;
    correctAnswer: number;
    graded: boolean;
    image: string;
}

export const GrammarQuizQuestion: React.FC<QuizQuestion> = ({questionIndex, question, answerChoices,  selectedAnswer, setAnswerSelections, correctAnswer, graded, image}) => {
    
    const changeAnswer = (index: number) => {
        setAnswerSelections((prevAnswers) => {
            const newAnswers = [...prevAnswers];
            newAnswers[questionIndex] = index;
            return newAnswers;
        });
    }

    return (
        <>
            
            <div className="image">
                <Image src={`data:image/png;base64,${image}`} alt={"Image Loading Failed"} />
            </div>
            <div className="question-text"> 
                {graded && selectedAnswer === correctAnswer && <span className="correct">✔️</span>}
                {graded && selectedAnswer !== correctAnswer && <span className="incorrect">❌</span>}
                <strong>{question}</strong>
            </div>
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