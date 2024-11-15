import React, { useState, useEffect } from 'react';
import './Story.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUIZ_RESPONSE_SCHEMA, STORY_RESPONSE_SCHEMA, fetchQuizResponse, fetchStory } from './constants';
import { Textarea, Button, Box, Input } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import { auth } from "./config/firebase"
import { Login } from "./auth/Login"
import { Signup } from "./auth/Signup"
import { Profile } from "./auth/Profile"
import { Routes, Route } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth"
import { Navbar } from "./Navbar"
import Storyverse from './storyverse.png'
import _ from 'lodash';
import { Select } from '@chakra-ui/react';

function Story() {
  // For navigating between different components
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0)
  const [currentStoryPage, setCurrentStoryPage] = useState(0)
  const [currentAge, setCurrentAge] = useState('')
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [artStyle, setArtStyle] = useState('picture book');
  const { data, isLoading, refetch } = useQuery<STORY_RESPONSE_SCHEMA>({
    queryKey: ['generate'],
    queryFn: () => fetchStory(currentAge, prompt, artStyle),
    refetchOnWindowFocus: false,
    enabled: false
  })
  const { data: quizData, isLoading: isQuizDataLoading, refetch: refetchQuizResponse } = useQuery<QUIZ_RESPONSE_SCHEMA>({
    queryKey: ['response'],
    queryFn: () => fetchQuizResponse(answer),
    refetchOnWindowFocus: false,
    enabled: false
  })

  useEffect(() => {
    // Ensure user is logged in before rendering
    if (!auth.currentUser) {
      navigate('/login');
    }
  }, []);

  const onClickPt1 = async () => {
    await refetch()
    setCurrentPage(currentPage + 1)
  }

  const onClickPt2 = async () => {
    await refetchQuizResponse()
    setCurrentPage(currentPage + 1)
  }

  const onClickPt3 = async () => {
    setCurrentPage(0)
    setCurrentAge('')
    setPrompt('')
    setAnswer('')
    setCurrentStoryPage(0)
    setArtStyle('picture book');
    queryClient.resetQueries({ 'queryKey': ['generate'] });
    queryClient.resetQueries({ 'queryKey': ['response'] });
  }

  return (
    <>
      <Navbar />
      <div className="Story">
        <Box boxSize='sm'>
          {
            currentPage === 0 ?
              <div className="grid">
                <Text className="title" as='b' fontSize='3xl'>
                  Welcome to Storyverse!
                </Text>
                <Image className="App-logo" src={Storyverse} />
                <Select
                  borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  placeholder="Select art style"
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value)}
                >
                  <option value="picture book">Picture Book</option>
                  <option value="comic">Comic</option>
                  <option value="pixar">Pixar</option>
                  <option value="abstract">Abstract</option>
                </Select>
                <Input
                  borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  placeholder={"Input your age"}
                  value={currentAge}
                  sx={{
                    '&::placeholder': {
                      color: 'black',
                    },
                  }}
                  onChange={(e) => setCurrentAge(e.target.value)} />
                <Textarea
                  borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  placeholder="Talk about the story you want to read"
                  value={prompt}
                  sx={{
                    '&::placeholder': {
                      color: 'black',
                    },
                  }}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button onClick={onClickPt1} isLoading={isLoading}>Generate</Button>
              </div> :
              currentPage === 1 ?
                <div className="grid">
                  {data && data?.story.length > 0 ?
                    <>
                      {_.map(data.story, (x, i) => (
                        i === currentStoryPage ? <Image src={`data:image/png;base64,${data.story[i].image}`} /> : null
                      ))}
                      <Text>{data.story[currentStoryPage].page_text}</Text>
                      <div className="split">
                        <Button onClick={() => {
                          if (currentStoryPage === 0) return

                          setCurrentStoryPage(currentStoryPage - 1)
                        }} disabled={currentStoryPage === 0}>Back</Button>
                        <Text>Page {currentStoryPage + 1} of {data.story.length}</Text>
                        <Button onClick={() => {
                          if (currentStoryPage === data?.story.length - 1) {
                            setCurrentPage(currentPage + 1)
                          } else {
                            setCurrentStoryPage(currentStoryPage + 1)
                          }
                        }}>{currentStoryPage === data?.story.length - 1 ? "Quiz" : "Next"}</Button>
                      </div>
                    </>
                    : null}
                </div> : currentPage === 2 ?
                  <div className="grid">
                    <Text>{data ? data?.first_question : null}</Text>
                    <Textarea
                      placeholder="Answer here"
                      borderColor="gray.500"
                      borderRadius="md"
                      focusBorderColor="blue.500"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                    <Button onClick={onClickPt2} isLoading={isQuizDataLoading}>Grade</Button>
                  </div> :
                  <div className="grid">
                    {quizData?.is_correct ? <CheckCircleIcon boxSize={14} color={'green'} /> : <CloseIcon color={'red'} />}
                    {quizData?.image ? <Image src={quizData.image} /> : null}
                    {quizData?.llm_response ? <Text>{quizData.llm_response}</Text> : null}
                    <Button onClick={onClickPt3} isLoading={isQuizDataLoading}>Finish</Button>
                  </div>
          }
        </Box>
      </div>
    </>
  );
}

export default Story;
