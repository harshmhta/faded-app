import { ThemedText } from '@/components/ThemedText';
import { useCourseProgress } from '@/contexts/CourseProgressContext';
import { getCourseChapter } from '@/data/courseContent';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Award01Icon,
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    ThumbsUpIcon,
    Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import {
    GestureHandlerRootView
} from 'react-native-gesture-handler';
import Animated, {
    FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showFinalScore, setShowFinalScore] = useState(false);

  if (!chapter || !chapter.quiz) {
    return (
      <View style={styles.container}>
        <ThemedText>Quiz not found</ThemedText>
      </View>
    );
  }

  const currentQuestion = chapter.quiz.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / chapter.quiz.questions.length;

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
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < chapter.quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResult(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const finalScore = Math.round((score / chapter.quiz.questions.length) * 100);
    setShowFinalScore(true);
    
    // Everyone passes and earns XP
    await completeChapter(chapter.id, finalScore, chapter.quiz.xpReward);
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
    
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.finalScoreContainer}>
          <Animated.View 
            entering={FadeIn.springify()}
            style={styles.finalScoreContent}
          >
            <View style={styles.scoreCircle}>
              <ThemedText style={styles.finalScoreText}>
                {finalScore}%
              </ThemedText>
            </View>
            
            <ThemedText type="title" style={styles.finalTitle}>
              Great Job! 🎉
            </ThemedText>
            
            <ThemedText style={styles.finalMessage}>
              You scored {finalScore}% and earned {chapter.quiz.xpReward} XP!
            </ThemedText>
            
            <Pressable
              onPress={() => router.back()}
              style={styles.finishButton}
            >
              <ThemedText style={styles.finishButtonText}>
                Continue
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Intro screen
  if (showIntro) {
    // Split description into subtitle and main text
    const descriptionParts = chapter.quiz.description.split('\n\n');
    const subtitle = descriptionParts[0];
    const mainDescription = descriptionParts[1] || chapter.quiz.description;

    return (
      <GestureHandlerRootView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 },
          ]}
        >
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.introBackButton}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={24}
              color={isDark ? '#fff' : '#000'}
            />
          </Pressable>

          {/* Main Card */}
          <Animated.View 
            entering={FadeIn.duration(600)}
            style={[
              styles.introCard,
              isDark ? styles.introCardDark : styles.introCardLight,
            ]}
          >
            <BlurView
              tint={isDark ? 'dark' : 'light'}
              intensity={24}
              style={styles.introCardBlur}
            />
            <LinearGradient
              pointerEvents="none"
              colors={
                isDark
                  ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.015)', 'rgba(255,255,255,0)']
                  : ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.015)', 'rgba(0,0,0,0)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.introCardGradient}
            />

            {/* Chapter Badge */}
            <View style={[
              styles.chapterBadge,
              isDark ? styles.chapterBadgeDark : styles.chapterBadgeLight,
            ]}>
              <ThemedText style={styles.chapterBadgeText}>
                Chapter {chapter.number}
              </ThemedText>
            </View>

            {/* Title */}
            <ThemedText style={styles.introCardTitle}>
              {chapter.quiz.title}
            </ThemedText>

            {/* Subtitle */}
            {descriptionParts.length > 1 && (
              <ThemedText style={styles.introCardSubtitle}>
                {subtitle}
              </ThemedText>
            )}

            {/* Description */}
            <ThemedText style={styles.introCardDescription}>
              {mainDescription}
            </ThemedText>

            {/* Stats */}
            <View style={styles.introStatsContainer}>
              <View style={styles.introStatItem}>
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={20}
                  color="#2196F3"
                  strokeWidth={2}
                />
                <ThemedText style={styles.introStatValue}>
                  {chapter.quiz.questions.length}
                </ThemedText>
                <ThemedText style={styles.introStatLabel}>
                  Questions
                </ThemedText>
              </View>

              <View style={styles.introStatItem}>
                <HugeiconsIcon
                  icon={ThumbsUpIcon}
                  size={20}
                  color="#4CAF50"
                  strokeWidth={2}
                />
                <ThemedText style={styles.introStatValue}>
                  {chapter.quiz.passingScore}%
                </ThemedText>
                <ThemedText style={styles.introStatLabel}>
                  To Pass
                </ThemedText>
              </View>

              <View style={styles.introStatItem}>
                <HugeiconsIcon
                  icon={Award01Icon}
                  size={20}
                  color="#FFD93D"
                  strokeWidth={2}
                />
                <ThemedText style={styles.introStatValue}>
                  +{chapter.quiz.xpReward}
                </ThemedText>
                <ThemedText style={styles.introStatLabel}>
                  XP Reward
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* Start Button */}
          <Animated.View entering={FadeIn.delay(200).duration(600)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowIntro(false);
              }}
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.startButtonPressed,
              ]}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              />
              <ThemedText style={styles.startButtonText}>
                Begin Quiz
              </ThemedText>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={20}
                color="#fff"
              />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
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
        <View>
          <ThemedText style={styles.questionText}>
            {currentQuestion.question}
          </ThemedText>
          
          {renderQuestion()}
        </View>

        {/* Submit/Next Button */}
        <Pressable
          onPress={showResult ? nextQuestion : checkAnswer}
          disabled={!showResult && !answers[currentQuestion.id]}
          style={[
            styles.submitButton,
            isDark ? styles.submitButtonDark : styles.submitButtonLight,
            !showResult && !answers[currentQuestion.id] && styles.submitButtonDisabled,
            showResult && isCorrect && styles.submitButtonCorrect,
            showResult && !isCorrect && styles.submitButtonIncorrect,
          ]}
        >
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={24}
            style={styles.submitBlur}
          />
          <LinearGradient
            colors={
              showResult && isCorrect
                ? ['rgba(76,175,80,0.15)', 'rgba(76,175,80,0.08)']
                : showResult && !isCorrect
                ? ['rgba(244,67,54,0.15)', 'rgba(244,67,54,0.08)']
                : answers[currentQuestion.id] 
                ? ['rgba(33,150,243,0.15)', 'rgba(33,150,243,0.08)']
                : ['rgba(128,128,128,0.1)', 'rgba(128,128,128,0.05)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          />
          
          {showResult && (
            <View style={styles.resultIconContainer}>
              <HugeiconsIcon
                icon={isCorrect ? CheckmarkCircle02Icon : CancelCircleIcon}
                size={24}
                color={isCorrect ? '#4CAF50' : '#F44336'}
              />
            </View>
          )}
          
          <ThemedText style={[
            styles.submitText,
            !showResult && !answers[currentQuestion.id] && styles.submitTextDisabled,
            showResult && isCorrect && styles.submitTextCorrect,
            showResult && !isCorrect && styles.submitTextIncorrect,
          ]}>
            {showResult 
              ? (currentQuestionIndex < chapter.quiz.questions.length - 1 
                  ? 'Next Question' 
                  : 'Finish Quiz')
              : 'Check Answer'
            }
          </ThemedText>
        </Pressable>
        
        {/* Explanation */}
        {showResult && !isCorrect && currentQuestion.explanation && (
          <View style={styles.explanationContainer}>
            <ThemedText style={styles.explanation}>
              {currentQuestion.explanation}
            </ThemedText>
          </View>
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
        const showCheckbox = isSelected || (showResult && isCorrect);
        
        return (
          <Pressable
            key={index}
            onPress={() => !showResult && toggleAnswer(option)}
            disabled={showResult}
            style={[
              styles.optionCard,
              isDark ? styles.optionCardDark : styles.optionCardLight,
              isSelected && !showResult && styles.optionCardSelected,
              showResult && isCorrect && styles.optionCardCorrect,
              showResult && isSelected && !isCorrect && styles.optionCardIncorrect,
            ]}
          >
            <View style={[
              styles.checkbox,
              isSelected && !showResult && styles.checkboxSelected,
              showResult && isCorrect && styles.checkboxCorrect,
              showResult && isSelected && !isCorrect && styles.checkboxIncorrect,
            ]}>
              {showCheckbox && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={16}
                  color="#fff"
                  strokeWidth={3}
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

// Matching Component
function MatchingQuestion({ question, matches, onUpdateMatches, showResult, isDark }: any) {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  
  const handleMatch = (conceptId: string, definitionId: string) => {
    onUpdateMatches({ ...matches, [conceptId]: definitionId });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConcept(null);
  };

  return (
    <View style={styles.matchingContainer}>
      <ThemedText style={styles.instructionText}>
        Tap a concept, then tap its matching definition
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
              <Pressable
                key={concept.id}
                disabled={showResult || !!matchedDefId}
                onPress={() => {
                  if (!showResult && !matchedDefId) {
                    setSelectedConcept(concept.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.conceptCard,
                  isDark ? styles.matchCardDark : styles.matchCardLight,
                  selectedConcept === concept.id && styles.conceptCardActive,
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
                          icon={CancelCircleIcon}
                          size={16}
                          color={isDark ? '#fff' : '#000'}
                        />
                      </Pressable>
                    )}
                  </View>
                )}
              </Pressable>
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
                disabled={showResult || !selectedConcept}
                onPress={() => {
                  if (!showResult && selectedConcept) {
                    handleMatch(selectedConcept, definition.id);
                  }
                }}
                style={[
                  styles.definitionCard,
                  isDark ? styles.matchCardDark : styles.matchCardLight,
                  selectedConcept && styles.definitionCardActive,
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
            {selectedConcept 
              ? 'Now tap the matching definition on the right'
              : 'Tap a concept to select it'
            }
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
  conceptCardActive: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: 'rgba(33,150,243,0.05)',
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
    padding: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonLight: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(33,150,243,0.3)',
  },
  submitButtonDark: {
    backgroundColor: 'rgba(16,16,16,0.5)',
    borderColor: 'rgba(33,150,243,0.4)',
  },
  submitButtonDisabled: {
    opacity: 0.4,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  submitButtonCorrect: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  submitButtonIncorrect: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  submitBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  submitGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  resultIconContainer: {
    marginRight: 12,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitTextDisabled: {
    opacity: 0.5,
  },
  submitTextCorrect: {
    color: '#4CAF50',
  },
  submitTextIncorrect: {
    color: '#F44336',
  },
  explanationContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(244,67,54,0.05)',
  },
  explanation: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  finalScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  finalScoreContent: {
    alignItems: 'center',
    width: '100%',
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  finalScoreText: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
  },
  finalTitle: {
    fontSize: 32,
    marginBottom: 16,
    fontWeight: '700',
  },
  finalMessage: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 26,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  finishButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  introBackButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 20,
  },
  introCard: {
    borderRadius: 28,
    padding: 28,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  introCardLight: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  introCardDark: {
    backgroundColor: 'rgba(16,16,16,0.55)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  introCardBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  introCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
  },
  chapterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
  },
  chapterBadgeLight: {
    backgroundColor: 'rgba(33,150,243,0.1)',
    borderColor: 'rgba(33,150,243,0.2)',
  },
  chapterBadgeDark: {
    backgroundColor: 'rgba(33,150,243,0.15)',
    borderColor: 'rgba(33,150,243,0.25)',
  },
  chapterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#2196F3',
  },
  introCardTitle: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 12,
  },
  introCardSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    opacity: 0.7,
    marginBottom: 16,
  },
  introCardDescription: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.75,
    marginBottom: 28,
  },
  introStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
  introStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  introStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  introStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonPressed: {
    opacity: 0.9,
  },
  startButtonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
