import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/constants/Fonts';
import { useCourseProgress } from '@/contexts/CourseProgressContext';
import { getCourseChapter } from '@/data/courseContent';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
    ArrowLeft01Icon,
    Award01Icon,
    CheckmarkCircle02Icon,
    QuizIcon,
    SquareLockPasswordIcon,
    ThumbsUpIcon,
    Time04Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChapterDetailScreen() {
  const { id } = useLocalSearchParams();
  const chapterNumber = parseInt(id as string);
  const chapter = getCourseChapter(chapterNumber);
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { progress, isSectionCompleted } = useCourseProgress();

  if (!chapter) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chapter not found</ThemedText>
      </ThemedView>
    );
  }

  const allSectionsCompleted = chapter.sections.every(section => 
    isSectionCompleted(chapter.id, section.id)
  );

  const handleSectionPress = (sectionId: string) => {
    router.push(`/lesson/${chapter.number}/${sectionId}`);
  };

  const handleQuizPress = () => {
    if (allSectionsCompleted) {
      router.push(`/quiz/${chapter.number}`);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10 },
          ]}
        >
          {/* Header with Back Button and Title */}
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
              <ThemedText style={styles.chapterHeaderTitle}>
                Chapter {chapter.number}
              </ThemedText>
            </View>
          </View>

          {/* Chapter Info */}
          <View style={styles.headerSection}>
            <ThemedText type="title" style={styles.chapterTitle}>
              {chapter.title}
            </ThemedText>
            <ThemedText style={styles.chapterDescription}>
              {chapter.description}
            </ThemedText>
          </View>

        {/* Sections */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
        >
          <ThemedText type="subtitle" style={styles.sectionHeader}>
            Lessons
          </ThemedText>
          
          {chapter.sections.map((section, index) => {
            const isCompleted = isSectionCompleted(chapter.id, section.id);
            
            return (
              <Animated.View
                key={section.id}
                entering={FadeInDown.delay(300 + index * 100).springify()}
              >
                <Pressable
                  onPress={() => handleSectionPress(section.id)}
                  style={[
                    styles.sectionCard,
                    isDark ? styles.cardDark : styles.cardLight,
                  ]}
                >
                  <BlurView
                    tint={isDark ? 'dark' : 'light'}
                    intensity={24}
                    style={styles.cardBlur}
                  />
                  
                  <View style={styles.sectionContent}>
                    <View style={styles.sectionInfo}>
                      <ThemedText style={styles.sectionNumber}>
                        Lesson {index + 1}
                      </ThemedText>
                      <ThemedText style={styles.sectionTitle}>
                        {section.title}
                      </ThemedText>
                      <View style={styles.sectionMeta}>
                        <HugeiconsIcon
                          icon={Time04Icon}
                          size={14}
                          color={isDark ? '#aaa' : '#666'}
                        />
                        <ThemedText style={styles.readTime}>
                          {section.readTime}
                        </ThemedText>
                        <View style={styles.xpBadge}>
                          <HugeiconsIcon
                            icon={Award01Icon}
                            size={14}
                            color="#FFD93D"
                          />
                          <ThemedText style={styles.xpText}>
                            {section.xpReward} XP
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.sectionStatus}>
                      {isCompleted ? (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={24}
                          color="#4CAF50"
                        />
                      ) : (
                        <View style={styles.incompleteDot} />
                      )}
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Quiz Section */}
        <Animated.View
          entering={FadeInDown.delay(500 + chapter.sections.length * 100).springify()}
        >
          <ThemedText type="subtitle" style={[styles.sectionHeader, styles.quizSectionHeader]}>
            Chapter Quiz
          </ThemedText>
          
          <Pressable
            onPress={handleQuizPress}
            disabled={!allSectionsCompleted}
            style={[
              styles.quizCard,
              isDark ? styles.cardDark : styles.cardLight,
              !allSectionsCompleted && styles.quizCardLocked,
              allSectionsCompleted && !progress?.quizScores[chapter.id] && styles.quizCardUnlocked,
              progress?.quizScores[chapter.id] && styles.quizCardCompleted,
            ]}
          >
            <BlurView
              tint={isDark ? 'dark' : 'light'}
              intensity={allSectionsCompleted ? 24 : 12}
              style={styles.cardBlur}
            />
            
            <LinearGradient
              colors={allSectionsCompleted 
                ? ['rgba(33,150,243,0.1)', 'rgba(33,150,243,0.05)']
                : ['transparent', 'transparent']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quizGradient}
            />
            
            <View style={styles.quizContent}>
              <HugeiconsIcon
                icon={allSectionsCompleted ? QuizIcon : SquareLockPasswordIcon}
                size={32}
                color={allSectionsCompleted 
                  ? '#2196F3' 
                  : isDark ? '#666' : '#999'
                }
              />
              
              <View style={styles.quizInfo}>
                <ThemedText style={[
                  styles.quizTitle,
                  !allSectionsCompleted && styles.lockedText,
                ]}>
                  {allSectionsCompleted 
                    ? chapter.quiz.title
                    : 'Complete all lessons to unlock the quiz'
                  }
                </ThemedText>
                
                 {allSectionsCompleted && (
                   <View style={styles.quizMeta}>
                     <View style={styles.xpBadge}>
                       <HugeiconsIcon
                         icon={Award01Icon}
                         size={14}
                         color="#FFD93D"
                       />
                       <ThemedText style={styles.xpText}>
                         {chapter.quiz.xpReward} XP
                       </ThemedText>
                     </View>
                     
                     {progress?.quizScores[chapter.id] && (
                       <View style={styles.quizScore}>
                         <HugeiconsIcon
                           icon={ThumbsUpIcon}
                           size={14}
                           color="#4CAF50"
                         />
                         <ThemedText style={styles.quizScoreText}>
                           {progress.quizScores[chapter.id]}%
                         </ThemedText>
                       </View>
                     )}
                   </View>
                 )}
               </View>
             </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  chapterHeaderTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  headerSection: {
    paddingTop: 0,
    paddingBottom: 24,
  },
  chapterTitle: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
  },
  chapterDescription: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
  },
  cardLight: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardDark: {
    backgroundColor: 'rgba(16,16,16,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  quizSectionHeader: {
    marginTop: 24,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 14,
    opacity: 0.6,
    marginLeft: 4,
    marginRight: 12,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,217,61,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#FFD93D',
  },
  sectionStatus: {
    marginLeft: 16,
  },
  incompleteDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  quizCard: {
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  quizCardLocked: {
    opacity: 0.6,
  },
  quizCardUnlocked: {
    borderColor: 'rgba(33,150,243,0.3)',
    borderWidth: 1,
  },
  quizCardCompleted: {
    borderColor: 'rgba(76,175,80,0.3)',
    borderWidth: 1,
  },
  quizGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  quizContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizInfo: {
    flex: 1,
    marginLeft: 16,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  lockedText: {
    opacity: 0.5,
  },
  quizMeta: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
});
