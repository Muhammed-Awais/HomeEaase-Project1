import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Home } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

export default function AnimatedSplashScreen({ onComplete }: Props) {
  // Border Animation
  const borderOpacity = useSharedValue(0.3);
  const borderScale = useSharedValue(1);

  // Logo Intro Animation
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  // Text Intro Animation
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // 1. Fade and scale in the logo
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });

    // 2. Start border pulse animation
    borderOpacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    borderScale.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // 3. Fade in text
    textOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
    );
    textTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) })
    );

    // 4. Complete splash after 3 seconds
    const timeout = setTimeout(() => {
      // Fade everything out
      logoOpacity.value = withTiming(0, { duration: 500 });
      textOpacity.value = withTiming(0, { duration: 500 });
      borderOpacity.value = withTiming(0, { duration: 500 });
      
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
    transform: [{ scale: borderScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.textContainerTop, textAnimatedStyle]}>
        <Text style={styles.appName}><Text style={styles.appNameLight}>HomeEase</Text> AI</Text>
      </Animated.View>

      <View style={styles.logoWrapper}>
        <Animated.View style={[styles.animatedBorder, borderAnimatedStyle]} />
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.innerLogo}>
            <Home color="#fff" size={48} strokeWidth={2} />
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.taglineContainer, textAnimatedStyle]}>
        <Text style={styles.taglineText}>Smart Living, Powered by</Text>
        <View style={styles.aaContainer}>
          <Text style={styles.aaTextHighlight}>A</Text>
          <Text style={styles.aaTextDark}>&A</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF', // Soft cream background
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainerTop: {
    position: 'absolute',
    top: height * 0.2,
  },
  appName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#2C2C2C', // Charcoal
    letterSpacing: 1,
  },
  appNameLight: {
    fontFamily: 'Outfit_500Medium',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedBorder: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#C6A584', // Warm gold/brown accent
    backgroundColor: 'rgba(198, 165, 132, 0.1)',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FAF8F5',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  innerLogo: {
    width: 90,
    height: 90,
    backgroundColor: '#C6A584', // Warm tan
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FAF8F5',
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
  },
  taglineText: {
    fontFamily: 'Outfit_300Light',
    fontSize: 14,
    color: '#6B5E57',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  aaContainer: {
    flexDirection: 'row',
  },
  aaTextHighlight: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: '#C6A584', // Warm accent
    letterSpacing: -1,
  },
  aaTextDark: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: '#4A423D',
    letterSpacing: -1,
  },
});
