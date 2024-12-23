import axios from "axios"


//const GENERATE_API = process.env.REACT_APP_BACKEND_URL
const GENERATE_API = "http://localhost:8000"

export type STORY_REQUEST_SCHEMA = {
    prompt: string
    age: string
    artStyle: string
    email: string
}

export type STORY_RESPONSE_SCHEMA = {
    story: {
        page_text: string
        image: string
    }[]
    first_question: string
}

export type QUIZ_REQUEST_SCHEMA = {
    story: string
    question: string
    answer: string
}

export type QUIZ_RESPONSE_SCHEMA = {
    image: string
    llm_response: string
    is_correct: boolean
    next_question: string
}

const apiClient = axios.create({
    baseURL: GENERATE_API,
});

export const fetchStory = async (age: string, prompt: string, artStyle: string, email: string): Promise<STORY_RESPONSE_SCHEMA> => {
    const response = await apiClient.post<STORY_RESPONSE_SCHEMA>('/story', { prompt: prompt, age: age, artStyle: artStyle, email:email });
    return response.data;
};

export const fetchQuizResponse = async (story: string, question: string, answer: string): Promise<QUIZ_RESPONSE_SCHEMA> => {
    const response = await apiClient.post<QUIZ_RESPONSE_SCHEMA>('/quiz-response', { story: story, question: question, answer: answer });
    return response.data;
};
