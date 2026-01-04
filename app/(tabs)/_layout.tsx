import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { CustomAnimatedTabIcon } from '@/components/custom-animated-tab-icon';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Instagram-style embedded navigation bar colors (from Google Stitch design)
  const navBarBg = isDark
    ? 'rgba(26, 20, 16, 0.85)'   // Dark mode glass background
    : 'rgba(245, 241, 232, 0.85)'; // Light mode glass background (#F5F1E8 at 85%)

  const borderColor = isDark
    ? 'rgba(62, 45, 36, 0.5)'    // #3E2D24 at 50%
    : 'rgba(232, 220, 200, 0.5)'; // #E8DCC8 at 50%

  // Active: primary color, Inactive: muted color (from Stitch design)
  const activeColor = isDark ? '#F5F1E8' : '#2C1810';
  const inactiveColor = isDark ? '#8B7355' : '#A89984';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false, // No text under icons (Instagram style)
        // Instagram-style embedded navigation bar
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: navBarBg,
          borderTopWidth: 0.5,
          borderTopColor: borderColor,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 12,
          // Subtle shadow for depth
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 30,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        // Add blur effect for iOS
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: navBarBg }]} />
          )
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CustomAnimatedTabIcon
              focused={focused}
              color={color}
              size={40}
              icon="home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CustomAnimatedTabIcon
              focused={focused}
              color={color}
              size={40}
              icon="compass"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CustomAnimatedTabIcon
              focused={focused}
              color={color}
              size={42}
              icon="create"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CustomAnimatedTabIcon
              focused={focused}
              color={color}
              size={40}
              icon="bookmark"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar but keep screen accessible
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CustomAnimatedTabIcon
              focused={focused}
              color={color}
              size={40}
              icon="user"
            />
          ),
        }}
      />
    </Tabs>
  );
}
