import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/constants/Fonts';
import { useCourseProgress } from '@/contexts/CourseProgressContext';
import { getChapterSection, getCourseChapter } from '@/data/courseContent';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Award01Icon,
    BulbIcon,
    CheckmarkCircle02Icon,
    Time04Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    if (chapter && section) {
      setIsCompleted(isSectionCompleted(chapter.id, section.id));
    }
  }, [chapter, section, isSectionCompleted]);

  if (!chapter || !section) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Lesson not found</ThemedText>
      </ThemedView>
    );
  }

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !isCompleted && !showCompletionButton) {
      setShowCompletionButton(true);
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

  const processText = (text: string) => {
    // Replace companion app references with app-specific features
    return text
      .replace(/Download the companion app/g, 'Use the built-in tools')
      .replace(/companion app/g, 'app')
      .replace(/The course works offline/g, 'Track your progress');
  };

  const renderTextWithBold = (text: string, key: string) => {
    const parts: (string | JSX.Element)[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    let partIndex = 0;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the bold part
      parts.push(
        <ThemedText key={`${key}-bold-${partIndex++}`} style={{ fontWeight: '700', fontFamily: FontFamily.bold }}>
          {match[1]}
        </ThemedText>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const renderContent = () => {
    const content = processText(section.content);
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
                ? ['rgba(76,175,80,0.15)', 'rgba(76,175,80,0.08)']
                : ['rgba(76,175,80,0.12)', 'rgba(76,175,80,0.05)']
              }
              style={styles.highlightGradient}
            />
            <View style={styles.highlightHeader}>
              <HugeiconsIcon
                icon={BulbIcon}
                size={20}
                color="#FFD93D"
              />
              <ThemedText style={styles.highlightTitle}>Key Insight</ThemedText>
            </View>
            <ThemedText style={styles.highlightedText}>
              {renderTextWithBold(part.trim(), `highlight-${index}`)}
            </ThemedText>
          </Animated.View>
        );
      }
      
      // Split by headers and paragraphs
      const lines = part.split('\n');
      return lines.map((line, lineIndex) => {
        const trimmedLine = line.trim();
        
        // H2 Headers - Major sections
        if (trimmedLine.startsWith('## ')) {
          return (
            <View key={`${index}-${lineIndex}`} style={styles.h2Container}>
              <LinearGradient
                colors={isDark 
                  ? ['rgba(33,150,243,0.15)', 'rgba(33,150,243,0.05)']
                  : ['rgba(33,150,243,0.1)', 'rgba(33,150,243,0.03)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.h2Gradient}
              />
              <ThemedText 
                type="subtitle" 
                style={styles.h2}
              >
                {trimmedLine.substring(3)}
              </ThemedText>
            </View>
          );
        }
        
        // H3 Headers - Subsections
        if (trimmedLine.startsWith('### ')) {
          return (
            <View key={`${index}-${lineIndex}`} style={styles.h3Container}>
              <View style={styles.h3Accent} />
              <ThemedText style={styles.h3}>
                {trimmedLine.substring(4)}
              </ThemedText>
            </View>
          );
        }
        
        // Bold standalone text
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.startsWith('• ')) {
          const content = trimmedLine.substring(2, trimmedLine.length - 2);
          
          return (
            <View key={`${index}-${lineIndex}`} style={styles.boldTextContainer}>
              <View style={styles.boldBullet}>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  color={isDark ? '#fff' : '#000'}
                  strokeWidth={2.5}
                />
              </View>
              <ThemedText style={styles.boldText}>
                {content}
              </ThemedText>
            </View>
          );
        }
        
        // List items with enhanced styling
        if (trimmedLine.startsWith('• ')) {
          const listContent = trimmedLine.substring(2);
          const boldMatch = listContent.match(/\*\*(.*?)\*\*/);
          
          if (boldMatch) {
            const beforeBold = listContent.substring(0, boldMatch.index);
            const boldText = boldMatch[1];
            const afterBold = listContent.substring((boldMatch.index || 0) + boldMatch[0].length);
            
            return (
              <View key={`${index}-${lineIndex}`} style={styles.listItem}>
                <View style={styles.bulletContainer}>
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    color="#2196F3"
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.listTextContainer}>
                  <ThemedText style={styles.listText}>
                    <ThemedText style={styles.listBold}>{boldText}</ThemedText>
                    {beforeBold && <ThemedText>{beforeBold}</ThemedText>}
                    {afterBold}
                  </ThemedText>
                </View>
              </View>
            );
          }
          
          return (
            <View key={`${index}-${lineIndex}`} style={styles.listItem}>
              <View style={styles.bulletContainer}>
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={14}
                  color="#2196F3"
                  strokeWidth={2}
                />
              </View>
              <View style={styles.listTextContainer}>
                <ThemedText style={styles.listText}>{listContent}</ThemedText>
              </View>
            </View>
          );
        }
        
        // Regular paragraphs with better spacing
        if (trimmedLine) {
          return (
            <ThemedText 
              key={`${index}-${lineIndex}`}
              style={styles.paragraph}
            >
              {renderTextWithBold(trimmedLine, `${index}-${lineIndex}`)}
            </ThemedText>
          );
        }
        
        return null;
      });
    });
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
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10 },
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
              <ThemedText style={styles.lessonTitle}>
                {section.title}
              </ThemedText>
            </View>
          </View>

          {/* Lesson Header */}
          <View style={styles.headerSection}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <HugeiconsIcon
                  icon={Time04Icon}
                  size={14}
                  color={isDark ? '#aaa' : '#666'}
                />
                <ThemedText style={styles.metaText}>
                  {section.readTime}
                </ThemedText>
              </View>
              
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
              
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    color="#4CAF50"
                  />
                  <ThemedText style={styles.completedText}>
                    Completed
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={styles.content}
          >
            {renderContent()}
          </Animated.View>

          {/* Completion Button */}
          {showCompletionButton && !isCompleted && (
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.completionSection}
            >
              <Pressable
                onPress={handleComplete}
                style={[
                  styles.completionButton,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                <BlurView
                  tint={isDark ? 'dark' : 'light'}
                  intensity={24}
                  style={styles.cardBlur}
                />
                
                <LinearGradient
                  colors={['rgba(76,175,80,0.1)', 'rgba(76,175,80,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.completionGradient}
                />
                
                <View style={styles.completionContent}>
                  <View style={styles.completionInfo}>
                    <ThemedText style={styles.completionTitle}>
                      Complete Lesson
                    </ThemedText>
                    <ThemedText style={styles.completionDescription}>
                      Mark this lesson as complete and earn XP
                    </ThemedText>
                  </View>
                  
                  <View style={styles.xpRewardBadge}>
                    <HugeiconsIcon
                      icon={Award01Icon}
                      size={20}
                      color="#FFD93D"
                    />
                    <ThemedText style={styles.xpRewardText}>
                      +{section.xpReward} XP
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}
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
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSection: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
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
    marginRight: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#FFD93D',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  content: {
    paddingBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
    opacity: 0.9,
  },
  h2Container: {
    marginTop: 32,
    marginBottom: 16,
    marginHorizontal: -4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  h2Gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h3Container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  h3Accent: {
    width: 3,
    height: 20,
    backgroundColor: '#2196F3',
    borderRadius: 2,
    marginRight: 12,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  boldTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  boldBullet: {
    marginRight: 8,
  },
  boldText: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 4,
    alignItems: 'flex-start',
  },
  bulletContainer: {
    paddingTop: 2,
    marginRight: 10,
  },
  listTextContainer: {
    flex: 1,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  listBold: {
    fontWeight: '700',
    opacity: 1,
  },
  highlightedSection: {
    marginVertical: 24,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  highlightedSectionLight: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  highlightedSectionDark: {
    backgroundColor: 'rgba(16,16,16,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(76,175,80,0.4)',
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
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    marginLeft: 8,
  },
  highlightedText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '600',
    opacity: 0.95,
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
  completionSection: {
    marginTop: 32,
  },
  completionButton: {
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  completionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  completionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionInfo: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  completionDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  xpRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,217,61,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 16,
  },
  xpRewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD93D',
    marginLeft: 6,
  },
});
