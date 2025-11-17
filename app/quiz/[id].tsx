import React, { useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getCourseChapter } from '@/data/courseContent';
import { useCourseProgress } from '@/contexts/CourseProgressContext';
import { QuizQuestion } from '@/types/course';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel02Icon,
  Award01Icon,
} from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';
import { 
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnswerState {
  [questionId: string]: string | string[] | { [conceptId: string]: string };
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const chapterNumber = parseInt(id as string);
  const chapter = getCourseChapter(chapterNumber);
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { completeChapter } = useCourseProgress();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showFinalScore, setShowFinalScore] = useState(false);

  const questionOpacity = useSharedValue(1);
  const resultScale = useSharedValue(0);

  if (!chapter || !chapter.quiz) {
    return (
      <View style={styles.container}>
        <ThemedText>Quiz not found</ThemedText>
      </View>
    );
  }

  const currentQuestion = chapter.quiz.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / chapter.quiz.questions.length;

  const animatedQuestionStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value,
  }));

  const animatedResultStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
  }));

  const checkAnswer = () => {
    let correct = false;
    const userAnswer = answers[currentQuestion.id];

    if (currentQuestion.type === 'multiple-choice') {
      correct = userAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'multi-select') {
      const userAnswers = (userAnswer as string[]) || [];
      const correctAnswers = currentQuestion.correctAnswer as string[];
      correct = userAnswers.length === correctAnswers.length &&
        userAnswers.every(ans => correctAnswers.includes(ans));
    } else if (currentQuestion.type === 'matching') {
      const userMatches = userAnswer as { [conceptId: string]: string };
      const correctPairs = currentQuestion.matches?.correctPairs || [];
      correct = correctPairs.every(pair => 
        userMatches[pair.conceptId] === pair.definitionId
      );
    }

    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setShowResult(true);
    resultScale.value = withSpring(1, { damping: 15 });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < chapter.quiz.questions.length - 1) {
      questionOpacity.value = withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      resultScale.value = withTiming(0, { duration: 200 });
      
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowResult(false);
      }, 200);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const finalScore = Math.round((score / chapter.quiz.questions.length) * 100);
    setShowFinalScore(true);
    
    if (finalScore >= chapter.quiz.passingScore) {
      await completeChapter(chapter.id, finalScore, chapter.quiz.xpReward);
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return <MultipleChoiceQuestion
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id] as string}
          onSelectAnswer={(answer) => setAnswers({ ...answers, [currentQuestion.id]: answer })}
          showResult={showResult}
          isDark={isDark}
        />;
      
      case 'multi-select':
        return <MultiSelectQuestion
          question={currentQuestion}
          selectedAnswers={(answers[currentQuestion.id] as string[]) || []}
          onSelectAnswers={(selected) => setAnswers({ ...answers, [currentQuestion.id]: selected })}
          showResult={showResult}
          isDark={isDark}
        />;
      
      case 'matching':
        return <MatchingQuestion
          question={currentQuestion}
          matches={(answers[currentQuestion.id] as { [conceptId: string]: string }) || {}}
          onUpdateMatches={(matches) => setAnswers({ ...answers, [currentQuestion.id]: matches })}
          showResult={showResult}
          isDark={isDark}
        />;
      
      default:
        return null;
    }
  };

  if (showFinalScore) {
    const finalScore = Math.round((score / chapter.quiz.questions.length) * 100);
    const passed = finalScore >= chapter.quiz.passingScore;
    
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.finalScoreContainer}>
          <Animated.View 
            entering={FadeIn.springify()}
            style={styles.finalScoreContent}
          >
            <View style={[
              styles.scoreCircle,
              passed ? styles.scoreCirclePassed : styles.scoreCircleFailed,
            ]}>
              <ThemedText style={styles.finalScoreText}>
                {finalScore}%
              </ThemedText>
            </View>
            
            <ThemedText type="title" style={styles.finalTitle}>
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </ThemedText>
            
            <ThemedText style={styles.finalMessage}>
              {passed 
                ? `You passed with ${finalScore}%! You've earned ${chapter.quiz.xpReward} XP.`
                : `You scored ${finalScore}%. The passing score is ${chapter.quiz.passingScore}%. Try again!`
              }
            </ThemedText>
            
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.finishButton,
                passed ? styles.finishButtonPassed : styles.finishButtonFailed,
              ]}
            >
              <ThemedText style={styles.finishButtonText}>
                {passed ? 'Continue' : 'Try Again'}
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={24}
              color={isDark ? '#fff' : '#000'}
            />
          </Pressable>
          
          <View style={styles.headerContent}>
            <ThemedText style={styles.quizTitle}>
              Chapter {chapter.number} Quiz
            </ThemedText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[
          styles.progressContainer,
          isDark ? styles.progressContainerDark : styles.progressContainerLight,
        ]}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>

        {/* Question Counter */}
        <ThemedText style={styles.questionCounter}>
          Question {currentQuestionIndex + 1} of {chapter.quiz.questions.length}
        </ThemedText>

        {/* Question */}
        <Animated.View style={animatedQuestionStyle}>
          <ThemedText style={styles.questionText}>
            {currentQuestion.question}
          </ThemedText>
          
          {renderQuestion()}
        </Animated.View>

        {/* Submit Button */}
        {!showResult && (
          <Pressable
            onPress={checkAnswer}
            disabled={!answers[currentQuestion.id]}
            style={[
              styles.submitButton,
              !answers[currentQuestion.id] && styles.submitButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={answers[currentQuestion.id] 
                ? ['#2196F3', '#1976D2']
                : ['#ccc', '#aaa']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            />
            <ThemedText style={styles.submitText}>
              Check Answer
            </ThemedText>
          </Pressable>
        )}

        {/* Result */}
        {showResult && (
          <Animated.View style={[styles.resultContainer, animatedResultStyle]}>
            <View style={[
              styles.resultCard,
              isCorrect ? styles.resultCardCorrect : styles.resultCardIncorrect,
            ]}>
              <HugeiconsIcon
                icon={isCorrect ? CheckmarkCircle02Icon : Cancel02Icon}
                size={48}
                color={isCorrect ? '#4CAF50' : '#F44336'}
              />
              <ThemedText style={styles.resultText}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </ThemedText>
              
              {!isCorrect && currentQuestion.explanation && (
                <ThemedText style={styles.explanation}>
                  {currentQuestion.explanation}
                </ThemedText>
              )}
              
              <Pressable
                onPress={nextQuestion}
                style={styles.nextButton}
              >
                <ThemedText style={styles.nextButtonText}>
                  {currentQuestionIndex < chapter.quiz.questions.length - 1 
                    ? 'Next Question' 
                    : 'Finish Quiz'
                  }
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

// Multiple Choice Component
function MultipleChoiceQuestion({ question, selectedAnswer, onSelectAnswer, showResult, isDark }: any) {
  return (
    <View style={styles.optionsContainer}>
      {question.options?.map((option: string, index: number) => {
        const isSelected = selectedAnswer === option;
        const isCorrect = option === question.correctAnswer;
        
        return (
          <Pressable
            key={index}
            onPress={() => !showResult && onSelectAnswer(option)}
            disabled={showResult}
            style={[
              styles.optionCard,
              isDark ? styles.optionCardDark : styles.optionCardLight,
              isSelected && styles.optionCardSelected,
              showResult && isCorrect && styles.optionCardCorrect,
              showResult && isSelected && !isCorrect && styles.optionCardIncorrect,
            ]}
          >
            <ThemedText style={[
              styles.optionText,
              isSelected && styles.optionTextSelected,
            ]}>
              {option}
            </ThemedText>
            
            {showResult && isCorrect && (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={20}
                color="#4CAF50"
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// Multi-Select Component
function MultiSelectQuestion({ question, selectedAnswers, onSelectAnswers, showResult, isDark }: any) {
  const toggleAnswer = (option: string) => {
    if (selectedAnswers.includes(option)) {
      onSelectAnswers(selectedAnswers.filter((ans: string) => ans !== option));
    } else {
      onSelectAnswers([...selectedAnswers, option]);
    }
  };

  return (
    <View style={styles.optionsContainer}>
      <ThemedText style={styles.instructionText}>
        Select all that apply
      </ThemedText>
      
      {question.options?.map((option: string, index: number) => {
        const isSelected = selectedAnswers.includes(option);
        const isCorrect = (question.correctAnswer as string[]).includes(option);
        
        return (
          <Pressable
            key={index}
            onPress={() => !showResult && toggleAnswer(option)}
            disabled={showResult}
            style={[
              styles.optionCard,
              isDark ? styles.optionCardDark : styles.optionCardLight,
              isSelected && styles.optionCardSelected,
              showResult && isCorrect && styles.optionCardCorrect,
              showResult && isSelected && !isCorrect && styles.optionCardIncorrect,
            ]}
          >
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
              showResult && isCorrect && styles.checkboxCorrect,
              showResult && isSelected && !isCorrect && styles.checkboxIncorrect,
            ]}>
              {isSelected && (
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={16}
                  color="#fff"
                />
              )}
            </View>
            
            <ThemedText style={[
              styles.optionText,
              styles.checkboxOptionText,
              isSelected && styles.optionTextSelected,
            ]}>
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// Matching Component with Drag and Drop
function MatchingQuestion({ question, matches, onUpdateMatches, showResult, isDark }: any) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const handleDrop = (conceptId: string, definitionId: string) => {
    onUpdateMatches({ ...matches, [conceptId]: definitionId });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.matchingContainer}>
      <ThemedText style={styles.instructionText}>
        Drag definitions to match with concepts
      </ThemedText>
      
      <View style={styles.matchingColumns}>
        <View style={styles.conceptsColumn}>
          <ThemedText style={styles.columnHeader}>Concepts</ThemedText>
          {question.matches?.concepts.map((concept: any) => {
            const matchedDefId = matches[concept.id];
            const matchedDef = question.matches.definitions.find(
              (d: any) => d.id === matchedDefId
            );
            const isCorrect = showResult && 
              question.matches.correctPairs.some(
                (p: any) => p.conceptId === concept.id && p.definitionId === matchedDefId
              );
            
            return (
              <View
                key={concept.id}
                style={[
                  styles.conceptCard,
                  isDark ? styles.matchCardDark : styles.matchCardLight,
                  showResult && isCorrect && styles.matchCardCorrect,
                  showResult && matchedDefId && !isCorrect && styles.matchCardIncorrect,
                ]}
              >
                <ThemedText style={styles.conceptText}>
                  {concept.text}
                </ThemedText>
                
                {matchedDef && (
                  <View style={[
                    styles.matchedDefinition,
                    showResult && isCorrect && styles.matchedDefinitionCorrect,
                    showResult && !isCorrect && styles.matchedDefinitionIncorrect,
                  ]}>
                    <ThemedText style={styles.matchedDefText}>
                      {matchedDef.text}
                    </ThemedText>
                    {!showResult && (
                      <Pressable
                        onPress={() => {
                          const newMatches = { ...matches };
                          delete newMatches[concept.id];
                          onUpdateMatches(newMatches);
                        }}
                        style={styles.removeMatch}
                      >
                        <HugeiconsIcon
                          icon={Cancel02Icon}
                          size={16}
                          color={isDark ? '#fff' : '#000'}
                        />
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        <View style={styles.definitionsColumn}>
          <ThemedText style={styles.columnHeader}>Definitions</ThemedText>
          {question.matches?.definitions.map((definition: any) => {
            const isMatched = Object.values(matches).includes(definition.id);
            
            if (isMatched && !showResult) return null;
            
            return (
              <Pressable
                key={definition.id}
                onPress={() => {
                  if (!showResult && draggedItem) {
                    handleDrop(draggedItem, definition.id);
                    setDraggedItem(null);
                  }
                }}
                style={[
                  styles.definitionCard,
                  isDark ? styles.matchCardDark : styles.matchCardLight,
                  draggedItem && styles.definitionCardActive,
                ]}
              >
                <ThemedText style={styles.definitionText}>
                  {definition.text}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
      
      {!showResult && (
        <View style={styles.matchingInstructions}>
          <ThemedText style={styles.matchingInstructionText}>
            Tap a definition, then tap the matching concept
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressContainerLight: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressContainerDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  questionCounter: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardLight: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  optionCardDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33,150,243,0.1)',
  },
  optionCardCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  optionCardIncorrect: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(128,128,128,0.3)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  checkboxCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  checkboxIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#F44336',
  },
  checkboxOptionText: {
    marginLeft: 0,
  },
  matchingContainer: {
    marginBottom: 24,
  },
  matchingColumns: {
    flexDirection: 'row',
    gap: 16,
  },
  conceptsColumn: {
    flex: 1,
  },
  definitionsColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  conceptCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  matchCardLight: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  matchCardDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  matchCardCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  matchCardIncorrect: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  conceptText: {
    fontSize: 14,
    fontWeight: '500',
  },
  definitionCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  definitionCardActive: {
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33,150,243,0.1)',
  },
  definitionText: {
    fontSize: 14,
  },
  matchedDefinition: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(33,150,243,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchedDefinitionCorrect: {
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  matchedDefinitionIncorrect: {
    backgroundColor: 'rgba(244,67,54,0.2)',
  },
  matchedDefText: {
    fontSize: 12,
    flex: 1,
  },
  removeMatch: {
    padding: 4,
  },
  matchingInstructions: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(33,150,243,0.05)',
  },
  matchingInstructionText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  submitButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  resultContainer: {
    marginTop: 20,
  },
  resultCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  resultCardCorrect: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  resultCardIncorrect: {
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  resultText: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  explanation: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  nextButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#2196F3',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  finalScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  finalScoreContent: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCirclePassed: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  scoreCircleFailed: {
    backgroundColor: 'rgba(244,67,54,0.2)',
    borderWidth: 3,
    borderColor: '#F44336',
  },
  finalScoreText: {
    fontSize: 48,
    fontWeight: '800',
  },
  finalTitle: {
    fontSize: 28,
    marginBottom: 12,
  },
  finalMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
  finishButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  finishButtonPassed: {
    backgroundColor: '#4CAF50',
  },
  finishButtonFailed: {
    backgroundColor: '#F44336',
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
