import React from "react";
import { GrammarQuizQuestion, QuizQuestion } from "./GrammarQuizQuestion"

export interface QuizQuestionList {
    quiz: QuizQuestion[]
}

export const GrammarQuiz: React.FC<QuizQuestionList> = ({quiz}) => {
    return (
        <>
            {quiz.map((quizQuestion, index) => (
                <GrammarQuizQuestion key={index} question={quizQuestion.question} answerChoices={quizQuestion.answerChoices} correctAnswer={quizQuestion.correctAnswer}/>
            ))}
        </>
    )
}