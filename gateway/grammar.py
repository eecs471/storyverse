import os
import openai
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from enum import Enum
import uvicorn
import requests
from fastapi.middleware.cors import CORSMiddleware
from together import Together
import requests
import base64

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

import json
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import OpenAI

openai.api_key = os.environ['OPENAI_API_KEY']

chat_llm_model = "gpt-3.5-turbo"
chat = ChatOpenAI(temperature=0.0, model=chat_llm_model)

def generate_grammar_quiz(age, interests):
    template = """Make a multiple choice grammar quiz for {age} year olds. \
        Incorporate these interests to make the questions more engaging: {interests}. \
        Use this as a template for how the questions should be formatted: \
        1. Which Word is a Conjunction? \
        We wanted to go outside, but it started to rain. \
        a) wanted \
        b) but \
        c) started \
        d) rain \
        Answer: b) but
    """

    prompt = ChatPromptTemplate.from_template(template)
    prompt = prompt.format_messages(age=age, interests=interests)

    response = chat(prompt)
    responseContent = response.content

    quiz = []
    questionNum = 1
    while True:
        question = {}

        # Find index where current question ends and get question conent
        endQuestionIndex = responseContent.find("Answer")
        if endQuestionIndex == -1: # No more questions to process
            break 

        startQuestionIndex = responseContent.find(str(questionNum))
        questionContent = responseContent[startQuestionIndex: endQuestionIndex + 11]

        # Separate question content into components (question, answer choices, etc...)
        questionComponents  = questionContent.splitlines()

        # Get question text from question components
        questionText = '\n'.join(questionComponents[0:2])
        question["question"] = questionText
        questionComponents = questionComponents[2:]

        # Get correct answer from question components
        answer = questionComponents[-1][8]
        question["correctAnswer"] = answer
        questionComponents = questionComponents[:-1]

        # Get answer choices for question (answer choices are all thats left)
        answerChoices = questionComponents
        question["answerChoices"] = answerChoices
        quiz.append(question)

        # Remove processed question from response content
        responseContent = responseContent[endQuestionIndex + 11:]
        questionNum += 1
    
    return quiz




class GrammarQuizGenerateRequestBody(BaseModel):
    age: int
    interests: list[str]

class GrammarQuestion(BaseModel):
    question: str
    answerChoices: list[str]
    correctAnswer: str

class GrammarQuiz(BaseModel):
    quiz: list[GrammarQuestion]
