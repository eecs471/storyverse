import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Box, Text, Badge, Table, Thead, Tbody, Tr, Th, Td, TableCaption, Progress } from "@chakra-ui/react";

export interface BadgeEntry {
    name: string;
}

export const Gamification = () => {
    const [streak, setStreak] = useState<number>(0);
    const [badges, setBadges] = useState<BadgeEntry[]>([]);
    const [questionsRemaining, setQuestionsRemaining] = useState<number>(0);
    const [quizzesRemaining, setQuizzesRemaining] = useState<number>(0);

    useEffect(() => {
        const fetchGamificationData = async () => {
            try {
                const userRef = doc(db, "users", auth.currentUser?.email as string);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    console.log("Document data:", userDoc.data());
                    const data = userDoc.data();

                    // Calculate streak (based on timestamp)
                    const lastQuizTimestamp = new Date(data.timestamp);
                    const currentDate = new Date();
                    const diffInDays = Math.floor(
                        (currentDate.getTime() - lastQuizTimestamp.getTime()) / (1000 * 3600 * 24)
                    );
                    setStreak(diffInDays === 1 ? (data.streak || 0) + 1 : 0);

                    // Calculate badges based on user data
                    const newBadges: BadgeEntry[] = [];
                    if (data.grammarQuestionsAnsweredCorrectly >= 10) {
                        newBadges.push({ name: "Grammar Guru" });
                    }
                    if (data.grammarQuestionsAnsweredCorrectly >= 30) {
                        newBadges.push({ name: "Master Shifu" });
                    }
                    if (data.grammarquizResults?.length >= 1) {
                        newBadges.push({ name: "First Quiz Completed" });
                    }
                    if (data.grammarquizResults?.length >= 10) {
                        newBadges.push({ name: "Quiz Master" });
                    }
                    if (streak >= 7) {
                        newBadges.push({ name: "One-Week Streak" });
                    }
                    if (data.interests?.includes("apples")) {
                        newBadges.push({ name: "Apple Enthusiast" });
                    }
                    if (data.interests?.includes("software")) {
                        newBadges.push({ name: "Developer" });
                    }
                    if (data.grammarquizResults?.some((quiz: { percentCorrect: number }) => quiz.percentCorrect === 100)) {
                        newBadges.push({ name: "Perfect Score" });
                    }
                    setBadges(newBadges);
                    const questionsToNextBadge = Math.max(0, 30 - data.grammarQuestionsAnsweredCorrectly);
                    const quizzesToNextBadge = Math.max(0, 10 - data.grammarquizResults?.length || 0);
                    setQuestionsRemaining(questionsToNextBadge);
                    setQuizzesRemaining(quizzesToNextBadge);
                }
                else{
                    console.log("No such document!");
                }
            } catch (err) {
                console.error("Error fetching gamification data:", err);
            }
        };

        fetchGamificationData();
    }, [streak]);

    return (
        <Box>
            {/* Gamification Header */}
            <Table colorScheme="teal" maxWidth={600} margin="auto">
                <TableCaption placement="top" fontSize="lg" fontWeight="bold"> Gamification Dashboard </TableCaption>

                {/* Streak Section */}
                <Thead>
                    <Tr>
                        <Th>Streak</Th>
                        <Th>Badges</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {/* Streak Display */}
                    <Tr>
                        <Td>{streak > 0 ? `${streak} Day${streak > 1 ? "s" : ""}` : "No Active Streak"}</Td>

                        {/* Badges Display */}
                        <Td>
                            {badges.length > 0 ? (
                                badges.map((badge, index) => (
                                    <Badge
                                        key={index}
                                        colorScheme={badge.name === "Quiz Master" ? "red" :
                                            badge.name === "Master Shifu" ? "yellow" :
                                            "blue"}
                                        variant="solid"
                                        p={2}
                                        m={1}
                                    >
                                        {badge.name}
                                    </Badge>
                                ))
                            ) : (
                                <Text>No badges yet! Keep going!</Text>
                            )}
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
            {/* Progress Tracker */}
            <Box mt={8} textAlign="center">
                <Text fontSize="xl" fontWeight="bold">Progress Tracker</Text>
                <Box my={4}>
                    <Text>Answer {questionsRemaining} more questions correctly to earn the Master Shifu badge!</Text>
                    <Progress
                        value={(30 - questionsRemaining) / 30 * 100}
                        size="lg"
                        colorScheme="green"
                        mt={2}
                    />
                </Box>
                <Box my={4}>
                    <Text>Complete {quizzesRemaining} more quizzes to unlock the Quiz Master badge!</Text>
                    <Progress
                        value={(10 - quizzesRemaining) / 10 * 100}
                        size="lg"
                        colorScheme="blue"
                        mt={2}
                    />
                </Box>
            </Box>
        </Box>
    );
};
