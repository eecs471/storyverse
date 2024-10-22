import React from "react";
import { useState } from "react"
import { Button, Input } from '@chakra-ui/react'

export interface QuizQuestion {
    question: string;
    answerChoices: string[];
    correctAnswer: string;
}

export const GrammarQuizQuestion: React.FC<QuizQuestion> = ({question, answerChoices, correctAnswer}) => {
    const [selectedOption, setSelectedOption] = useState<number>(-1);
    const answer = correctAnswer;
    
    const handleAnswerChange = (index: number) => {
        setSelectedOption(index);
    }

    return (
        <>
            <strong>{question}</strong>
            {answerChoices.map((answerChoice, index) => (
                <div className="multiple-choice-option">
                    <input 
                        type="radio"
                        name={question}
                        value={answerChoice}
                        checked={index === selectedOption}
                        onChange={() => handleAnswerChange(index)}
                    />
                    <label> {answerChoice} </label>
                </div>
            ))}
            <br />
        </>
    )
}