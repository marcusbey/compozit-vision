import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { tokens } from '@theme';

export const ProcessingPanel: React.FC = () => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (opacity: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );

      Animated.parallel([
        createAnimation(dot1Opacity, 0),
        createAnimation(dot2Opacity, 200),
        createAnimation(dot3Opacity, 400),
      ]).start();
    };

    animateDots();
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Creating Your AI Design</Text>
        <Text style={styles.subtitle}>
          Our AI is analyzing your image and transforming it based on your vision
        </Text>

        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.step}>✨ Analyzing your space...</Text>
          <Text style={styles.step}>🎨 Applying your style preferences...</Text>
          <Text style={styles.step}>🤖 Generating your design...</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: tokens.color.brand,
  },
  stepsContainer: {
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
  },
  step: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    fontStyle: 'italic',
  },
});