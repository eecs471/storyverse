import os
import openai
from fastapi import FastAPI
from fastapi import Response
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
import grammar

openai.api_key = os.environ['OPENAI_API_KEY']

chat_llm_model = "gpt-4"
chat = ChatOpenAI(temperature=0.0, model=chat_llm_model)

image_llm = OpenAI(temperature=0.0)

together_ai = 'https://api.together.xyz/inference'

def create_story_v1(outline, age):
    template_string = """Generate a story for a {age} year old girl \
        which consists of three paragraphs with each paragraph four sentences long. \
        The story should be about the following: ```{outline}```
        In the story, there should be a dramatic situation and a happy ending. \
        Response MUST be in json format with each key and value being paragraph number \
        and text of each paragraph being its value.
    """

    prompt_template = ChatPromptTemplate.from_template(template_string)

    #prompt_template.messages[0].prompt
    story_prompt = prompt_template.format_messages(
                    age=age,
                    outline=outline)
    story_response = chat(story_prompt)

    story_response.content = json.loads(story_response.content)
    story = story_response.content
    story.update({'story': "\n".join(story.values())})

    return story

def create_story(outline, age):
    # template_string = """Generate a story for a {age} year old girl \
    #     which consists of three paragraphs with each paragraph four sentences long. \
    #     The story should be about the following: ```{outline}``` \
    #     In the story, there should be a dramatic situation and a happy ending. \
    #     After the story, generate a question to check the comprehension of the story. \
    #     Response MUST be in json format with each key and value being paragraph number \
    #     and text of each paragraph being its value, and for the key "question" have the generated question as value.
    # """
    
    agent_role = """You are a Story Generating Assistant. Your task is to identify and enhance a real story that is suitable for a child of the specified age and closely matches the given outline/instructions. The story can be from any genre (fiction, non-fiction, historical, etc.), but it must be based on real events, characters, themes, or settings. Maintain the core elements of the original story and try to change the story as least as possible while following the outline and instructions provided. Do not hallucinate"""
    template_string = """ 
    {agent_role}. Generate an engaging story for a {age}-year-old child that consists of three sections. 
    The story should be written in simple, age-appropriate language and should align with the following topic or outline: ```{outline}```. 
    Make sure the story is easy to follow and enjoyable for a child of this age. After the story, generate a question to check the child's comprehension of the story.

    The response must be in **JSON format** as follows:
    - The key for each section will be the paragraph number (e.g., "paragraph1", "paragraph2", "paragraph3").
    - Each value will be the corresponding paragraph text.
    - Include a key called "question" with the comprehension question as its value.

    Ensure that the story is coherent, follows the outline, and is appropriate for the child's age.
    """

    prompt_template = ChatPromptTemplate.from_template(template_string)

    #prompt_template.messages[0].prompt
    story_prompt = prompt_template.format_messages(
                    agent_role=agent_role,
                    age=age,
                    outline=outline)
    story_response = chat(story_prompt)

    story_response.content = json.loads(story_response.content)
    story = story_response.content
    paras = [v for k, v in story.items() if k != 'question']
    story.update({'story': "\n".join(paras)})
    return story

def validate_answer(story, answer):
    template_string = """
        For the following story, question and answer in triple single quotes, \
        return 'CORRECT' if the answer correctly answers the question, \
        and 'FALSE' if it does not answer the question. \
        story: ```{story}``` \
        question: ```{question}``` \
        answer: ```{answer}```
    """

    prompt_template = ChatPromptTemplate.from_template(template_string)

    prompt = prompt_template.format_messages(
                    story=story["story"],
                    question=story["question"],
                    answer=answer)
    response = chat(prompt)

    return response.content

def _generate_image_description(story, age, scene):
    image_desc = """Given the following story context: {story}. \
        Generate an image description that MUST be relevant for a {age} year old and \
        for the following scene: {scene} and response MUST be string.
    """
    image_template = ChatPromptTemplate.from_template(image_desc)

    image_prompt = image_template.format_messages(
                    age=age,
                    scene=scene,
                    story=story)
    image_scene_desc = chat(image_prompt)
    return image_scene_desc.content

def generate_image_descriptions(story, age):
    image_descriptions = {}

    for i, scene in story.items():
        if i != 'story' and i != 'question':
            image_desc = _generate_image_description(story, age, scene)
            image_descriptions[i] = image_desc

    return image_descriptions

def _generate_image(image_description, age):
    prompt = PromptTemplate(
        input_variables=["image_description"],
        template="""Generate the image so that it is in the style of a rendered in a detailed, animated, CGI-inspired style \
            The following is a description of a scene: {image_description}.
        """
    )
    chain = LLMChain(llm=image_llm, prompt=prompt)
    image_url = DallEAPIWrapper().run(chain.run(
        image_description
    ))
    
    return image_url

    
def _generate_image_stable_diff(image_desc, artStyle):
    print(artStyle)
    template = ""
    if artStyle == 'picture book':
        template="""Generate an image in the high-quality, style of a picture book. \
        The following is a description of the scene that you MUST include all details of it: {0}.
        """.format(image_desc)
    elif artStyle == 'pixar':
        template="""Generate an image in the high-quality, 3D-rendered style of Pixar films. \
       The following is a description of the scene that you MUST include all details of it: {0}.
       """.format(image_desc)
    elif artStyle == 'comic':
        template="""Generate an image in the high-quality, style of comic books. \
        The following is a description of the scene that you MUST include all details of it: {0}.
        """.format(image_desc)
    elif artStyle == 'abstract':
        template="""Generate an image in the art style of cubism while still following the description. \
        The following is a description of the scene that you MUST include all details of it: {0}.
        """.format(image_desc)
    else:
        print("art style invalid")
    print(template)

    client = Together(api_key=os.environ.get('TOGETHER_API_KEY'))
    response = client.images.generate(
        model="stabilityai/stable-diffusion-xl-base-1.0",
        prompt=template,
        #"negative_prompt": "",
        #"request_type": "image-model-inference",
        width=1024,
        height=1024,
        steps=20,
        n=1
        #"seed": 42,
        #"sessionKey": "921f5c1d53fd74664f3e2366a613bfaafecc0621",
        #"type": "image"
    )
    images = response.data
    print("AT TRACE:")
    image_url = images[0].url
    response = requests.get(image_url)
    if response.status_code == 200:
        image = base64.b64encode(response.content).decode('utf-8')
        return image
    return ""

def generate_images(image_descriptions, age, artStyle):
    images = {}
    for i, image_desc in image_descriptions.items():
        # image_url = _generate_image(image_desc, age)
        image_url = _generate_image_stable_diff(image_desc, artStyle)
        images[i] = image_url
    
    return images

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

test_txt = "Image of a cat"
test_img = "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?auto=format&fit=crop&q=80&w=2487&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

test_question = "How are you today?"

class Story(BaseModel):
    page_text: str
    image: str


class StoryGenerateRequestBody(BaseModel):
    prompt: str
    age: str
    artStyle: str


class StoryGenerateResponse(BaseModel):
    story: List[Story]
    first_question: str


@app.post("/story", response_model=StoryGenerateResponse)
async def generate(request_body: StoryGenerateRequestBody):

    story = create_story(request_body.prompt, request_body.age)
    print("STORIES")
    print(story)
    descriptions = generate_image_descriptions(story, request_body.age)
    print("DESCRIPTIONS")
    print(descriptions)
    print("ART STYLE")
    artStyle = request_body.artStyle
    print(request_body)
    images = generate_images(descriptions, request_body.age, artStyle)
    #import pdb; pdb.set_trace()

    return_val = {"story": [], "first_question": story["question"]}

    for i in range(len(descriptions)):
        r = {
            "page_text": story["paragraph" + str(i+1)],
            "image": images["paragraph" + str(i+1)]
        }
        return_val["story"].append(r)
    
    return return_val


class QuizResponseRequestBody(BaseModel):
    answer: str

class QuizResponseModel(BaseModel):
    image: str
    llm_response: str
    is_correct: bool
    next_question: str


@app.post("/quiz-response", response_model=QuizResponseModel)
async def quiz_response(request_body: QuizResponseRequestBody):
    return {
        "image": test_img,
        "llm_response": "Correct response",
        "is_correct": True,
        "next_question": ""
    }

@app.post("/grammar", response_model=grammar.GrammarQuiz)
async def generate_grammar_quiz(request_body: grammar.GrammarQuizGenerateRequestBody):
    quiz_content = grammar.generate_grammar_quiz(request_body.age, request_body.interests)
    images = grammar.generate_images_grammar_quiz_stable_diff(request_body.interests, len(quiz_content["quiz"]))
    for i in range(len(quiz_content["quiz"])):
        image = ""
        if i < len(images):
            image = images[i]
        
        question = quiz_content["quiz"][i]
        question["image"] = image
    
    return quiz_content

@app.post("/grammarchatapi")
async def handle_grammar_quiz_chat(request_body: grammar.GrammarChatRequestBody):
    response_content = grammar.handle_chat(request_body.userPrompt, request_body.quiz, request_body.userAnswers, request_body.correctAnswers, request_body.history)
    return Response(content=response_content, media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
