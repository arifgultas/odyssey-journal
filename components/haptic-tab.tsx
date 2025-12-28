import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = (ev: any) => {
    // Haptic feedback on iOS
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scale down animation (like Stitch's active:scale-95)
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    // Scale back to normal with bounce
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();

    props.onPressOut?.(ev);
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: scaleValue }],
      }}
    >
      <PlatformPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          props.style,
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      />
    </Animated.View>
  );
}

