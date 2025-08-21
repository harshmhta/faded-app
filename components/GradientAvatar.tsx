import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface GradientAvatarProps {
  name: string;
  size?: number;
}

export function GradientAvatar({ name, size = 60 }: GradientAvatarProps) {
  // Get initials from name
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <View 
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]}
    >
      <ThemedText style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#FF8A65',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8A65',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  initials: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});
