/**
 * Animation constants and utilities for Odyssey Journal
 * Premium micro-animations for travel journal UX
 */

import { Easing } from 'react-native-reanimated';

// Animation timing presets
export const AnimationTiming = {
    // Quick micro-interactions
    fast: 150,
    // Normal UI transitions
    normal: 300,
    // Emphasis animations
    slow: 500,
    // Complex animations
    complex: 800,
    // Pull to refresh
    pullRefresh: 1000,
    // Loading & spinners
    loading: 1500,
} as const;

// Easing presets
export const AnimationEasing = {
    // Standard easing curves
    easeIn: Easing.bezier(0.4, 0, 1, 1),
    easeOut: Easing.bezier(0, 0, 0.2, 1),
    easeInOut: Easing.bezier(0.4, 0, 0.2, 1),

    // Bounce easing for playful animations
    bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),

    // Spring-like easing
    spring: Easing.bezier(0.175, 0.885, 0.32, 1.275),

    // Smooth easing for continuous animations
    smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
} as const;

// Spring configuration presets
export const SpringConfig = {
    // Gentle spring for subtle movements
    gentle: {
        damping: 20,
        stiffness: 120,
        mass: 1,
    },
    // Bouncy spring for playful interactions
    bouncy: {
        damping: 8,
        stiffness: 180,
        mass: 0.8,
    },
    // Snappy spring for quick responses
    snappy: {
        damping: 15,
        stiffness: 250,
        mass: 0.6,
    },
    // Slow spring for dramatic effects
    slow: {
        damping: 30,
        stiffness: 80,
        mass: 1.2,
    },
} as const;

// Like button animation values
export const LikeAnimationConfig = {
    // Scale sequence: press down -> pop up -> settle
    scaleDown: 0.9,
    scaleUp: 1.2,
    scaleNormal: 1.0,

    // Heart fill animation timing
    fillDuration: 400,

    // Particle burst configuration
    particleCount: 6,
    particleSize: 8,
    particleDistance: 30,
} as const;

// Follow button animation values
export const FollowAnimationConfig = {
    // Button morph duration
    morphDuration: 300,

    // Checkmark draw duration
    checkmarkDuration: 400,

    // Color transition duration
    colorDuration: 250,
} as const;

// FAB animation values
export const FABAnimationConfig = {
    // Breathing animation
    breathingScale: 1.05,
    breathingDuration: 2000,

    // Scroll shrink
    shrinkScale: 0.8,
    shrinkDuration: 200,

    // Tap feedback
    tapScale: 0.95,
    tapDuration: 100,

    // Ripple effect
    rippleScale: 2.5,
    rippleDuration: 400,
} as const;

// Post card animation values
export const PostCardAnimationConfig = {
    // Appear animation
    appearDuration: 400,
    appearDelay: 100,
    translateY: 20,

    // Press animation
    pressScale: 0.98,
    shadowDecrease: 0.5,

    // Image blur to sharp
    blurDuration: 300,
} as const;

// Badge animation values
export const BadgeAnimationConfig = {
    // Pop in
    popInScale: 1.3,
    popInDuration: 300,

    // Number flip
    flipDuration: 200,
} as const;

// Empty state animation values
export const EmptyStateAnimationConfig = {
    // Floating animation
    floatingDistance: 10,
    floatingDuration: 3000,

    // Typewriter effect
    typewriterDelay: 50,
} as const;

// Loading spinner animation values
export const SpinnerAnimationConfig = {
    // Compass needle rotation
    needleRotationDuration: 2000,

    // Vintage wobble
    wobbleAngle: 5,
} as const;

// Pull to refresh animation values
export const PullRefreshAnimationConfig = {
    // Compass rotation based on pull distance
    maxPullDistance: 120,
    rotationMultiplier: 4, // 4 full rotations at max pull

    // Release animation
    releaseRotation: 360,
    releaseDuration: 1000,
} as const;
