import { tokens } from '@theme';
import React, { ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SlidingBottomPanelProps {
  height: Animated.Value;
  opacity: Animated.Value;
  children: ReactNode;
}

export const SlidingBottomPanel: React.FC<SlidingBottomPanelProps> = ({
  height,
  opacity,
  children
}) => {
  return (
    <Animated.View style={[styles.panel, { height, opacity }]}>
      <View style={styles.handle} />
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: tokens.layout.tabBarHeight,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.surface,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    zIndex: tokens.zIndex.fixed,
    ...tokens.shadow.e3,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg + tokens.layout.bottomSafeArea,
  },
});
