import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontFamily } from '@/constants/Fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { courseData } from '@/data/courseContent';
import { useCourseProgress } from '@/contexts/CourseProgressContext';
import { CourseChapter } from '@/types/course';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  Award01Icon,
  FireIcon,
  CheckmarkCircle02Icon,
  SquareLockPasswordIcon,
  Notebook02Icon,
} from '@hugeicons/core-free-icons';

export default function CourseScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { progress, loading, isChapterUnlocked, calculateStreak } = useCourseProgress();
  const [selectedChapter, setSelectedChapter] = useState<CourseChapter | null>(null);

  useEffect(() => {
    calculateStreak();
  }, []);

  const handleChapterPress = (chapter: CourseChapter) => {
    if (isChapterUnlocked(chapter.number)) {
      router.push(`/chapter/${chapter.number}`);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {!selectedChapter && (
        <View style={styles.courseSelection}>
          <ThemedText type="subtitle" style={styles.selectionTitle}>
            Your Recovery Journey
          </ThemedText>
          <ThemedText style={styles.selectionDescription}>
            A comprehensive, science-based course to help you build a fulfilling life
          </ThemedText>

          {/* Stats Bar */}
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={[
              styles.statsBar,
              isDark && styles.statsBarDark,
            ]}
          >
            <View style={styles.stat}>
              <View style={[
                styles.statIconContainer,
                { backgroundColor: 'rgba(255, 107, 107, 0.15)' }
              ]}>
                <HugeiconsIcon
                  icon={FireIcon}
                  size={14}
                  color="#FF6B6B"
                />
                <ThemedText style={[styles.statIconText, { color: '#FF6B6B' }]}>
                  {progress?.streakDays || 0}
                </ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.stat}>
              <View style={[
                styles.statIconContainer,
                { backgroundColor: 'rgba(255, 217, 61, 0.15)' }
              ]}>
                <HugeiconsIcon
                  icon={Award01Icon}
                  size={14}
                  color="#FFD93D"
                />
                <ThemedText style={[styles.statIconText, { color: '#FFD93D' }]}>
                  {progress?.totalXP || 0}
                </ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>Total XP</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.stat}>
              <View style={[
                styles.statIconContainer,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }
              ]}>
                <ThemedText style={styles.statIconText}>
                  {progress?.completedChapters.length || 0}/{courseData.chapters.length}
                </ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>Chapters</ThemedText>
            </View>
          </Animated.View>

          <ThemedText style={styles.chaptersTitle}>
            Course Chapters
          </ThemedText>
        </View>
      )}
    </View>
  );

  const renderChapter = ({ item: chapter, index }: { item: CourseChapter; index: number }) => {
    const isUnlocked = isChapterUnlocked(chapter.number);
    const isCompleted = progress?.completedChapters.includes(chapter.id) ?? false;
    const isCurrent = progress?.currentChapter === chapter.number;
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <Pressable
          style={[
            styles.chapterCard,
            isDark && styles.chapterCardDark,
            !isUnlocked && styles.chapterCardLocked,
            isCompleted && styles.chapterCardCompleted,
            isCurrent && styles.chapterCardCurrent,
          ]}
          onPress={() => handleChapterPress(chapter)}
          disabled={!isUnlocked}
        >

          <View style={styles.chapterContent}>
            <View style={styles.chapterHeader}>
              <View style={[
                styles.chapterIconContainer,
                !isUnlocked && styles.chapterIconLocked,
                isCompleted && styles.chapterIconCompleted,
                isCurrent && styles.chapterIconCurrent,
              ]}>
                {!isUnlocked ? (
                  <HugeiconsIcon
                    icon={SquareLockPasswordIcon}
                    size={24}
                    color={isDark ? '#666' : '#999'}
                  />
                ) : isCompleted ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={24}
                    color="#4CAF50"
                  />
                ) : (
                  <ThemedText style={styles.chapterIcon}>
                    {chapter.icon || '📚'}
                  </ThemedText>
                )}
              </View>
              
              <View style={styles.chapterInfo}>
                <ThemedText style={styles.chapterNumber}>
                  Chapter {chapter.number}
                </ThemedText>
                <ThemedText style={[
                  styles.chapterTitle,
                  !isUnlocked && styles.chapterTitleLocked,
                ]}>
                  {chapter.title}
                </ThemedText>
                <ThemedText style={[
                  styles.chapterSubtitle,
                  !isUnlocked && styles.chapterSubtitleLocked,
                ]}>
                  {chapter.subtitle}
                </ThemedText>
              </View>
            </View>

            {isUnlocked && (
              <View style={styles.chapterMeta}>
                <View style={styles.chapterStats}>
                  <View style={[
                    styles.chapterStat,
                    isDark && styles.chapterStatDark,
                  ]}>
                    <HugeiconsIcon
                      icon={Notebook02Icon}
                      size={14}
                      color={isDark ? '#aaa' : '#666'}
                    />
                    <ThemedText style={styles.chapterStatText}>
                      {chapter.sections.length} lessons
                    </ThemedText>
                  </View>
                  
                  <View style={[
                    styles.xpBadge,
                    isDark && styles.xpBadgeDark,
                  ]}>
                    <HugeiconsIcon
                      icon={Award01Icon}
                      size={14}
                      color="#FFD93D"
                    />
                    <ThemedText style={styles.xpText}>
                      {chapter.sections.reduce((sum, section) => sum + section.xpReward, 0) + chapter.quiz.xpReward} XP
                    </ThemedText>
                  </View>
                </View>
                
                {isCompleted && progress?.quizScores[chapter.id] && (
                  <View style={styles.completionBadge}>
                    <ThemedText style={styles.completionText}>
                      Quiz: {progress.quizScores[chapter.id]}%
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <ThemedText style={styles.emptyText}>Loading course content...</ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
        },
      ]}
    >
      <FlatList
        data={courseData.chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 50 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 8,
  },
  courseSelection: {
    marginBottom: 0,
  },
  selectionTitle: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  selectionDescription: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: FontFamily.regular,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    backgroundColor: '#F6F7F9',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  statsBarDark: {
    backgroundColor: '#181A1B',
    borderColor: '#2A2A2A',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6,
  },
  statIconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
    fontFamily: FontFamily.medium,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginHorizontal: 16,
  },
  chaptersTitle: {
    fontSize: 18,
    fontFamily: FontFamily.medium,
    marginBottom: 16,
    opacity: 0.8,
  },
  chapterCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    backgroundColor: '#F6F7F9',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  chapterCardDark: {
    backgroundColor: '#181A1B',
    borderColor: '#2A2A2A',
  },
  chapterCardLocked: {
    opacity: 0.6,
  },
  chapterCardCompleted: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  chapterCardCurrent: {
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  chapterContent: {
    flex: 1,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chapterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(33,150,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chapterIconLocked: {
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  chapterIconCompleted: {
    backgroundColor: 'rgba(76,175,80,0.15)',
  },
  chapterIconCurrent: {
    backgroundColor: 'rgba(33,150,243,0.15)',
  },
  chapterIcon: {
    fontSize: 24,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    fontFamily: FontFamily.medium,
  },
  chapterTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  chapterTitleLocked: {
    opacity: 0.5,
  },
  chapterSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
    marginBottom: 16,
  },
  chapterSubtitleLocked: {
    opacity: 0.4,
  },
  chapterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chapterStat: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterStatDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chapterStatText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
    fontFamily: FontFamily.medium,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpBadgeDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  xpText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    marginLeft: 4,
    opacity: 0.8,
  },
  completionBadge: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
    color: '#4CAF50',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    fontFamily: FontFamily.regular,
  },
});
