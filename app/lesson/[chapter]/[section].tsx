import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getChapterSection, getCourseChapter } from '@/data/courseContent';
import { useCourseProgress } from '@/contexts/CourseProgressContext';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  ArrowLeft01Icon,
  Time04Icon,
  Award01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LessonScreen() {
  const { chapter: chapterNum, section: sectionId } = useLocalSearchParams();
  const chapterNumber = parseInt(chapterNum as string);
  const chapter = getCourseChapter(chapterNumber);
  const section = getChapterSection(chapterNumber, sectionId as string);
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { completeSection, isSectionCompleted } = useCourseProgress();
  const [isCompleted, setIsCompleted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showCompletionButton, setShowCompletionButton] = useState(false);
  
  const buttonScale = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (chapter && section) {
      setIsCompleted(isSectionCompleted(chapter.id, section.id));
    }
  }, [chapter, section, isSectionCompleted]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  if (!chapter || !section) {
    return (
      <View style={styles.container}>
        <ThemedText>Lesson not found</ThemedText>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !isCompleted && !showCompletionButton) {
      setShowCompletionButton(true);
      buttonScale.value = withSpring(1, { damping: 15 });
      buttonOpacity.value = withSpring(1);
    }
  };

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeSection(chapter.id, section.id, section.xpReward);
    setIsCompleted(true);
    
    // Navigate to next section or back to chapter
    const currentSectionIndex = chapter.sections.findIndex(s => s.id === section.id);
    if (currentSectionIndex < chapter.sections.length - 1) {
      const nextSection = chapter.sections[currentSectionIndex + 1];
      router.replace(`/lesson/${chapterNumber}/${nextSection.id}`);
    } else {
      router.back();
    }
  };

  const renderContent = () => {
    const content = section.content;
    const parts = content.split(/\/highlight|\/endhighlight/);
    
    return parts.map((part, index) => {
      const isHighlighted = index % 2 === 1;
      
      if (isHighlighted) {
        return (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(300).springify()}
            style={[
              styles.highlightedSection,
              isDark ? styles.highlightedSectionDark : styles.highlightedSectionLight,
            ]}
          >
            <BlurView
              tint={isDark ? 'dark' : 'light'}
              intensity={20}
              style={styles.highlightBlur}
            />
            <LinearGradient
              colors={isDark 
                ? ['rgba(76,175,80,0.1)', 'rgba(76,175,80,0.05)']
                : ['rgba(76,175,80,0.08)', 'rgba(76,175,80,0.03)']
              }
              style={styles.highlightGradient}
            />
            <ThemedText style={styles.highlightedText}>
              {part.trim()}
            </ThemedText>
          </Animated.View>
        );
      }
      
      // Split by headers
      const lines = part.split('\n');
      return lines.map((line, lineIndex) => {
        const trimmedLine = line.trim();
        
        // H2 Headers
        if (trimmedLine.startsWith('## ')) {
          return (
            <ThemedText 
              key={`${index}-${lineIndex}`}
              type="subtitle" 
              style={styles.h2}
            >
              {trimmedLine.substring(3)}
            </ThemedText>
          );
        }
        
        // H3 Headers
        if (trimmedLine.startsWith('### ')) {
          return (
            <ThemedText 
              key={`${index}-${lineIndex}`}
              style={styles.h3}
            >
              {trimmedLine.substring(4)}
            </ThemedText>
          );
        }
        
        // Bold text
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          return (
            <ThemedText 
              key={`${index}-${lineIndex}`}
              style={styles.boldText}
            >
              {trimmedLine.substring(2, trimmedLine.length - 2)}
            </ThemedText>
          );
        }
        
        // List items
        if (trimmedLine.startsWith('• ')) {
          const listContent = trimmedLine.substring(2);
          // Check for bold within list
          const boldMatch = listContent.match(/\*\*(.*?)\*\*/);
          if (boldMatch) {
            const beforeBold = listContent.substring(0, boldMatch.index);
            const boldText = boldMatch[1];
            const afterBold = listContent.substring((boldMatch.index || 0) + boldMatch[0].length);
            
            return (
              <View key={`${index}-${lineIndex}`} style={styles.listItem}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.listText}>
                  {beforeBold}
                  <ThemedText style={styles.listBold}>{boldText}</ThemedText>
                  {afterBold}
                </ThemedText>
              </View>
            );
          }
          
          return (
            <View key={`${index}-${lineIndex}`} style={styles.listItem}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.listText}>{listContent}</ThemedText>
            </View>
          );
        }
        
        // Regular paragraphs
        if (trimmedLine) {
          return (
            <ThemedText 
              key={`${index}-${lineIndex}`}
              style={styles.paragraph}
            >
              {trimmedLine}
            </ThemedText>
          );
        }
        
        return null;
      });
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.springify()}
        style={[
          styles.header,
          { paddingTop: insets.top + 20 },
          isDark ? styles.headerDark : styles.headerLight,
        ]}
      >
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={80}
          style={styles.headerBlur}
        />
        
        <View style={styles.headerContent}>
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
          
          <View style={styles.headerInfo}>
            <ThemedText style={styles.lessonLabel}>
              Chapter {chapterNumber} • Lesson
            </ThemedText>
            <ThemedText style={styles.lessonTitle} numberOfLines={1}>
              {section.title}
            </ThemedText>
          </View>
          
          {isCompleted && (
            <Animated.View entering={FadeIn.springify()}>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={24}
                color="#4CAF50"
              />
            </Animated.View>
          )}
        </View>
        
        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <HugeiconsIcon
              icon={Time04Icon}
              size={16}
              color={isDark ? '#aaa' : '#666'}
            />
            <ThemedText style={styles.metaText}>
              {section.readTime}
            </ThemedText>
          </View>
          
          <View style={styles.metaItem}>
            <HugeiconsIcon
              icon={Award01Icon}
              size={16}
              color="#FFD93D"
            />
            <ThemedText style={styles.metaText}>
              {section.xpReward} XP
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.content}
        >
          {renderContent()}
        </Animated.View>
      </ScrollView>

      {/* Completion Button */}
      {showCompletionButton && !isCompleted && (
        <Animated.View 
          style={[
            styles.completionContainer,
            { paddingBottom: insets.bottom + 20 },
            animatedButtonStyle,
          ]}
        >
          <Pressable
            onPress={handleComplete}
            style={[
              styles.completionButton,
              isDark ? styles.completionButtonDark : styles.completionButtonLight,
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.completionGradient}
            />
            <ThemedText style={styles.completionText}>
              Complete Lesson
            </ThemedText>
            <View style={styles.xpReward}>
              <HugeiconsIcon
                icon={Award01Icon}
                size={20}
                color="#fff"
              />
              <ThemedText style={styles.xpRewardText}>
                +{section.xpReward} XP
              </ThemedText>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerDark: {
    backgroundColor: 'rgba(16,16,16,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  lessonLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  lessonMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.7,
  },
  scrollContent: {
    paddingTop: 140,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 40,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  boldText: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.6,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  listBold: {
    fontWeight: '600',
  },
  highlightedSection: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlightedSectionLight: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
  },
  highlightedSectionDark: {
    backgroundColor: 'rgba(16,16,16,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  highlightBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  highlightGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  highlightedText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
  },
  completionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  completionButton: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  completionButtonLight: {
    backgroundColor: '#4CAF50',
  },
  completionButtonDark: {
    backgroundColor: '#4CAF50',
  },
  completionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  completionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 16,
  },
  xpReward: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpRewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
});
