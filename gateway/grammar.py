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
from langchain.schema import SystemMessage, HumanMessage, AIMessage

openai.api_key = os.environ['OPENAI_API_KEY']

chat_llm_model = "gpt-3.5-turbo"
chat = ChatOpenAI(temperature=0.0, model=chat_llm_model)

def generate_grammar_quiz(age, interests):
    template = """Make a 5 question multiple choice grammar quiz with a difficulty level tailored towards {age} year olds. \
        Incorporate these interests to make the questions more engaging: {interests}. \
        Use this as a template for how the questions should be formatted: \
        1. Which Word is a Conjunction? \
        We wanted to go outside, but it started to rain. \
        a) wanted \
        b) but \
        c) started \
        d) rain \
        Answer: b) but \
        Make sure to include Answer: for each question
    """

    prompt = ChatPromptTemplate.from_template(template)
    prompt = prompt.format_messages(age=age, interests=interests)

    response = chat.invoke(prompt)
    responseContent = response.content

    quiz = []
    correctAnswers = []
    questionNum = 1
    while True:
        question = {}

        # Find index where current question ends and get question conent
        endQuestionIndex = responseContent.find("Answer")
        if endQuestionIndex == -1: # No more questions to process
            break 

        startQuestionIndex = responseContent.find(str(questionNum))
        questionContent = responseContent[startQuestionIndex: endQuestionIndex + 11]

        # Get question text from question content
        endQuestionTextIndex = questionContent.find("a)")
        questionText = questionContent[:endQuestionTextIndex]
        question["question"] = questionText

        # Separate rest of question content into components (answer choices, correct answer, etc...)
        questionContent = questionContent[endQuestionTextIndex:]
        questionComponents  = questionContent.splitlines()
        questionComponents = [component.lstrip() for component in questionComponents]

        # Get correct answer from question components
        answer = questionComponents[-1][8]
        correctAnswers.append(ord(answer) - 97) # convert to number between 0-3
        questionComponents = questionComponents[:-1]

        # Get answer choices for question (answer choices are all thats left)
        answerChoices = questionComponents

        # Get rid of empty answer choices caused by splitlines
        while answerChoices[-1] == '':
            answerChoices.pop()

        question["answerChoices"] = answerChoices
        quiz.append(question)

        # Remove processed question from response content
        responseContent = responseContent[endQuestionIndex + 11:]
        questionNum += 1
    
    return {"quiz": quiz, "correctAnswers": correctAnswers}

def generate_image_grammar_quiz_stable_diff(image_desc):
    template="""Generate an engaging image for a grammar quiz question with the following text: {0}
    """.format(image_desc)

    client = Together(api_key=os.environ.get('TOGETHER_API_KEY'))
    response = client.images.generate(
        model="stabilityai/stable-diffusion-xl-base-1.0",
        prompt=template,
        width=256,
        height=256,
        steps=10,
        n=1
    )
    images = response.data
    image_url = images[0].url
    response = requests.get(image_url)
    if response.status_code == 200:
        image = base64.b64encode(response.content).decode('utf-8')
        return image
    return ""

class GrammarQuizGenerateRequestBody(BaseModel):
    age: int
    interests: list[str]

class GrammarQuestion(BaseModel):
    question: str
    answerChoices: list[str]
    image: str

class GrammarQuiz(BaseModel):
    quiz: list[GrammarQuestion]
    correctAnswers: list[int]



def handle_chat(userPrompt, quiz, userAnswers, correctAnswers, history):
    teacherContextTemplate = """You are a teacher who is answering questions a student has about a quiz they just took. \
        They may have questions regarding the quiz questions or general topics the quiz covers. \
        Here are the questions and answer choices for each question: {quiz} \
        Here are the correct answers for the quiz {correctAnswers} \
        Here are the answers selected by the student {userAnswers} \
        For the correct answers and user answers 0 corresponds to option a, 1 to option b, 2 to option c, and 3 to option d
    """
    teacherContext = ChatPromptTemplate.from_template(teacherContextTemplate)
    teacherContext = teacherContext.format_messages(quiz=quiz, correctAnswers=correctAnswers, userAnswers=userAnswers)
    
    messages = [SystemMessage(content=teacherContext[0].content)]

    for i in range(len(history) - 1):
        messages.append(HumanMessage(content=history[i]))
        messages.append(AIMessage(content=history[i + 1]))
    messages.append(HumanMessage(content=userPrompt))

    response = chat.invoke(messages)
    responseContent = response.content
    
    return responseContent

class GrammarChatRequestBody(BaseModel):
    userPrompt: str
    quiz: list[GrammarQuestion]
    userAnswers: list[int]
    correctAnswers: list[int]
    history: list[str]