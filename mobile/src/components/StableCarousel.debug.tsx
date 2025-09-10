import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StableCarousel, CarouselImage } from './StableCarousel';

// Debug version with performance monitoring
export const StableCarouselDebug: React.FC<{
  images: CarouselImage[];
  autoPlay?: boolean;
  showLabels?: boolean;
  height?: number;
  isActive?: boolean;
}> = (props) => {
  const renderStart = Date.now();
  
  React.useEffect(() => {
    const renderTime = Date.now() - renderStart;
    console.log(`🎬 StableCarousel render time: ${renderTime}ms`);
  }, []);
  
  return (
    <View style={styles.debugContainer}>
      <StableCarousel {...props} />
      
      {/* Debug overlay */}
      <View style={styles.debugOverlay}>
        <Text style={styles.debugText}>
          📊 Images: {props.images?.length || 0} | Auto: {props.autoPlay ? '✅' : '❌'} | Active: {props.isActive ? '✅' : '❌'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    flex: 1,
    position: 'relative',
  },
  debugOverlay: {
    position: 'absolute',
    top: 100,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  debugText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});