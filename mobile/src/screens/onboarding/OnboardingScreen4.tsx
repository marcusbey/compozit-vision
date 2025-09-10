import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { tokens } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../../types';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(height * 0.55);

type TestimonialSlide = {
  image: any;
  avatar: any;
  quote: string;
  author: string;
};

const SLIDES: TestimonialSlide[] = [
  {
    image: require('../../assets/masonry/urban-industrial-loft.png'),
    avatar: require('../../assets/testimonials/maria-l-real-estate-agent.png'),
    quote: '“Helped me stage 3 homes this month — each sold faster.”',
    author: 'Maria L • Real Estate Agent',
  },
  {
    image: require('../../assets/masonry/natural-rustic-living-room.png'),
    avatar: require('../../assets/testimonials/james-k-homeowner.png'),
    quote: '“Finally nailed my style. The AI got exactly what I wanted.”',
    author: 'James K • Homeowner',
  },
  {
    image: require('../../assets/masonry/single-family-modern-living-room.png'),
    avatar: require('../../assets/testimonials/sophie-m-interior-designer.png'),
    quote: '“Saved me hours of moodboarding. Clients love the speed.”',
    author: 'Sophie M • Interior Designer',
  },
  {
    image: require('../../assets/masonry/urban-industrial-kitchen.png'),
    avatar: require('../../assets/testimonials/andre-p-contractor.png'),
    quote: '“From photo to polished concepts in minutes. Game changer.”',
    author: 'Andre P • Contractor',
  },
  {
    image: require('../../assets/masonry/townhouse-georgian-foyer.png'),
    avatar: require('../../assets/testimonials/rina-s-architect.png'),
    quote: '“Elegant results with zero friction. Looks premium.”',
    author: 'Rina S • Architect',
  },
  {
    image: require('../../assets/masonry/natural-rustic-kitchen.png'),
    avatar: require('../../assets/testimonials/carla-v-homeowner.png'),
    quote: '“Made decisions easier for my family — beautiful options.”',
    author: 'Carla V • Homeowner',
  },
];

const AUTO_PLAY_INTERVAL_MS = 3200;

const OnboardingScreen4: React.FC<NavigationProps> = ({ navigation, route }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const overlayAnim = useRef(new Animated.Value(1)).current; // full overlay at start
  const [overlayHidden, setOverlayHidden] = useState<boolean>(false);
  const listRef = useRef<FlatList<TestimonialSlide>>(null);
  const [index, setIndex] = useState(0);

  // Staggered content animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(16)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descTranslate = useRef(new Animated.Value(18)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslate = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      const hideOverlay = !!(route && route.params && route.params.hideOverlay);
      
      // Reset values on focus so animation always runs
      overlayAnim.stopAnimation();
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      titleOpacity.stopAnimation();
      titleTranslate.stopAnimation();
      descOpacity.stopAnimation();
      descTranslate.stopAnimation();
      ctaOpacity.stopAnimation();
      ctaTranslate.stopAnimation();

      overlayAnim.setValue(hideOverlay ? 0 : 1);
      setOverlayHidden(hideOverlay);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      titleOpacity.setValue(0);
      titleTranslate.setValue(16);
      descOpacity.setValue(0);
      descTranslate.setValue(18);
      ctaOpacity.setValue(0);
      ctaTranslate.setValue(20);

      const sequences: Animated.CompositeAnimation[] = [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          delay: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 900,
          delay: 250,
          useNativeDriver: true,
        }),
      ];
      
      if (!hideOverlay) {
        // Fade away the full-screen overlay to reveal the carousel + content
        sequences.push(
          Animated.timing(overlayAnim, {
            toValue: 0,
            duration: 2000,
            delay: 500,
            useNativeDriver: true,
          })
        );
      }

      const mainAnimation = Animated.parallel(sequences);

      // Run stagger animations in parallel with main animation
      const staggerAnimation = Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(titleOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(titleTranslate, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(descOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(descTranslate, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ctaOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(ctaTranslate, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]);

      // Start both animations together
      Animated.parallel([mainAnimation, staggerAnimation]).start(() => {
        if (!hideOverlay) setOverlayHidden(true);
      });

      // Cleanup on blur: stop any running animations and ensure overlay is opaque again
      return () => {
        overlayAnim.stopAnimation(() => overlayAnim.setValue(hideOverlay ? 0 : 1));
        fadeAnim.stopAnimation(() => fadeAnim.setValue(0));
        slideAnim.stopAnimation(() => slideAnim.setValue(50));
        titleOpacity.stopAnimation(() => titleOpacity.setValue(0));
        titleTranslate.stopAnimation(() => titleTranslate.setValue(16));
        descOpacity.stopAnimation(() => descOpacity.setValue(0));
        descTranslate.stopAnimation(() => descTranslate.setValue(18));
        ctaOpacity.stopAnimation(() => ctaOpacity.setValue(0));
        ctaTranslate.stopAnimation(() => ctaTranslate.setValue(20));
        setOverlayHidden(hideOverlay);
      };
    }, [route])
  );

  useEffect(() => {
    const id = setInterval(() => {
      const next = (index + 1) % SLIDES.length;
      setIndex(next);
      if (listRef.current) {
        listRef.current.scrollToIndex({ index: next, animated: true });
      }
    }, AUTO_PLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [index]);

  const handleContinue = () => {
    NavigationHelpers.navigateToScreen('paywall');
  };

  const handleBack = () => {
    NavigationHelpers.navigateToScreen('onboarding3', { hideOverlay: true });
  };

  const renderItem = ({ item }: { item: TestimonialSlide }) => (
    <View style={styles.slide}>
      <ImageBackground source={item.image} style={styles.slideImage} resizeMode="cover">
        <LinearGradient
          colors={[ 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.70)' ]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.slideOverlay}>
          <View style={styles.testimonialTopRow}>
            <View style={styles.avatar}>
              <Image source={item.avatar} style={styles.avatarImage} />
            </View>
            <View style={styles.starRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={18} color="#F2CC8F" />
              ))}
            </View>
          </View>
          <Text style={styles.quote}>{item.quote}</Text>
          <Text style={styles.author}>{item.author}</Text>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <SafeAreaView edges={['left','right']} style={styles.container}>
      {/* Minimal header: back only */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flex: 1,
        }}
      >
        {/* Top hero: full-bleed carousel like Screen 3 */}
        <View style={styles.hero}>
          <FlatList
            ref={listRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={SLIDES}
            keyExtractor={(_, i) => `slide-${i}`}
            renderItem={renderItem}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setIndex(newIndex);
            }}
          />
          {/* Bottom gradient for depth */}
          <LinearGradient
            colors={['transparent', tokens.colors.overlay.light, tokens.colors.overlay.medium]}
            locations={[0, 0.8, 1]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 150,
            }}
          />
          {/* Startup overlay: fully opaque then fades out to reveal carousel */}
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {!overlayHidden && (
              <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tokens.colors.overlay.solid, opacity: overlayAnim }]} />
            )}
          </View>
        </View>

        {/* Spacer to push content below hero height */}
        <View style={styles.heroSpacer} />

        {/* Lower section background */}
        <View style={styles.lowerBackground} />

        {/* Bottom half: headline + body */}
        <View style={styles.bottomCopy}>
          <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] }]}>Loved by Thousands</Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: descOpacity, transform: [{ translateY: descTranslate }] }]}>
            50K+ happy users  •  4.9★ average rating  •  Trusted by professionals worldwide
          </Animated.Text>
          <Animated.Text style={[styles.community, { opacity: descOpacity, transform: [{ translateY: descTranslate }] }]}>
            Join the community — don’t get left behind.
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Bottom action: match Screen 2/3 */}
      <Animated.View style={[styles.bottomContainer, { opacity: ctaOpacity, transform: [{ translateY: ctaTranslate }] }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <View style={styles.continueButtonContent}>
            <Text style={styles.continueButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#2D2B28" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.deep,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing['2xl'],
    paddingBottom: tokens.spacing.sm,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroSpacer: {
    height: HERO_HEIGHT,
  },
  lowerBackground: {
    position: 'absolute',
    top: HERO_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.background.deep,
  },
  slide: {
    width,
    height: '100%',
  },
  slideImage: {
    flex: 1,
  },
  slideOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: 12,
    padding: 14,
  },
  testimonialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  quote: {
    color: '#FDFBF7',
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  author: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  bottomCopy: {
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing['2xl'],
    paddingBottom: Math.round(tokens.spacing['3xl'] * 0.75),
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: tokens.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    maxWidth: 560,
  },
  community: {
    marginTop: tokens.spacing.sm,
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    maxWidth: 560,
    fontWeight: '400',
  },
  bottomContainer: {
    position: 'absolute',
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
    bottom: tokens.spacing['2xl'],
    backgroundColor: 'transparent',
  },
  continueButton: {
    backgroundColor: 'rgba(212, 165, 116, 0.9)',
    borderRadius: 28,
    height: 56,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2B28',
    marginRight: tokens.spacing.sm,
  },
});

export default OnboardingScreen4;
