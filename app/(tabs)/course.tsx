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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
  Time04Icon,
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
            Recovery Journey
          </ThemedText>
          <ThemedText style={styles.selectionDescription}>
            A comprehensive, science-based course to help you quit cannabis and build a fulfilling life without it.
          </ThemedText>

          {/* Stats Bar */}
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={[
              styles.statsBar,
              isDark ? styles.statsBarDark : styles.statsBarLight,
            ]}
          >
            <BlurView
              tint={isDark ? 'dark' : 'light'}
              intensity={24}
              style={styles.statsBlur}
            />
            
            <View style={styles.stat}>
              <HugeiconsIcon
                icon={FireIcon}
                size={20}
                color="#FF6B6B"
              />
              <ThemedText style={styles.statValue}>{progress?.streakDays || 0}</ThemedText>
              <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.stat}>
              <HugeiconsIcon
                icon={Award01Icon}
                size={20}
                color="#FFD93D"
              />
              <ThemedText style={styles.statValue}>{progress?.totalXP || 0}</ThemedText>
              <ThemedText style={styles.statLabel}>Total XP</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>
                {progress?.completedChapters.length || 0}/13
              </ThemedText>
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
            isDark ? styles.chapterCardDark : styles.chapterCardLight,
            !isUnlocked && styles.chapterCardLocked,
            isCompleted && styles.chapterCardCompleted,
            isCurrent && styles.chapterCardCurrent,
          ]}
          onPress={() => handleChapterPress(chapter)}
          disabled={!isUnlocked}
        >
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={isUnlocked ? 24 : 12}
            style={styles.chapterBlur}
          />
          
          <LinearGradient
            colors={
              isCompleted 
                ? ['rgba(76,175,80,0.1)', 'rgba(76,175,80,0.05)']
                : isCurrent
                ? ['rgba(33,150,243,0.1)', 'rgba(33,150,243,0.05)']
                : ['transparent', 'transparent']
            }
            style={styles.chapterGradient}
          />

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
                  <View style={styles.chapterStat}>
                    <HugeiconsIcon
                      icon={Time04Icon}
                      size={14}
                      color={isDark ? '#aaa' : '#666'}
                    />
                    <ThemedText style={styles.chapterStatText}>
                      {chapter.sections.length} lessons
                    </ThemedText>
                  </View>
                  
                  <View style={styles.xpBadge}>
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
          { paddingBottom: insets.bottom + 100 },
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
    paddingHorizontal: 20,
  },
  headerContent: {
    paddingVertical: 20,
  },
  courseSelection: {
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  selectionDescription: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: 24,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  statsBarLight: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  statsBarDark: {
    backgroundColor: 'rgba(16,16,16,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statsBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginHorizontal: 16,
  },
  chaptersTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  chapterCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  chapterCardLight: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  chapterCardDark: {
    backgroundColor: 'rgba(16,16,16,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chapterCardLocked: {
    opacity: 0.6,
  },
  chapterCardCompleted: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  chapterCardCurrent: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  chapterBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chapterGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
    borderRadius: 24,
    backgroundColor: 'rgba(33,150,243,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterIconLocked: {
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  chapterIconCompleted: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  chapterIconCurrent: {
    backgroundColor: 'rgba(33,150,243,0.2)',
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
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  chapterTitleLocked: {
    opacity: 0.5,
  },
  chapterSubtitle: {
    fontSize: 14,
    opacity: 0.7,
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
  },
  chapterStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterStatText: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.6,
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
  completionBadge: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
});
