import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { SvgProps } from "react-native-svg";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Button } from "@/shared/components/Button";
import { Colors } from "@/shared/constants/colors";
import {
  ONBOARDING_SLIDES,
  OnboardingSlide,
} from "@/features/onboarding/data/slides";

// SVG Imports
import Onboarding1 from "@/assets/icons/onboarding/onboarding1.svg";
import Onboarding2 from "@/assets/icons/onboarding/onboarding2.svg";
import Onboarding3Light from "@/assets/icons/onboarding/onboarding3light.svg";
import Onboarding3Dark from "@/assets/icons/onboarding/onboarding3dark.svg";
import Logo from "@/assets/icons/shared/logo.svg";

const { width } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  // Dynamic SVG mapping per theme
  const ILLUSTRATIONS: Record<string, React.FC<SvgProps>> = {
    chat: Onboarding1,
    security: Onboarding2,
    organized: isDark ? Onboarding3Dark : Onboarding3Light,
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    const lastIndex = ONBOARDING_SLIDES.length - 1;
    flatListRef.current?.scrollToIndex({
      index: lastIndex,
      animated: true,
    });
  };

  const handleComplete = () => {
    console.log("Onboarding completed. Navigate to login");
    // router.replace("/(auth)/login");
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <MySafeAreaView color={themeColors.background}>
      {/* Header Container with Centered Logo & Right Skip Button */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Logo />
        </View>

        {!isLastSlide ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Typography
              variant="body"
              weight="medium"
              color={themeColors.primary}
            >
              Skip
            </Typography>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Swipeable Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }: { item: OnboardingSlide }) => {
          const SvgIllustration = ILLUSTRATIONS[item.illustration];

          return (
            <View style={[styles.slide, { width }]}>
              <View style={styles.illustrationContainer}>
                {SvgIllustration ? (
                  <SvgIllustration width={"100%"} height={"115%"} />
                ) : null}
              </View>

              <View style={styles.textContainer}>
                <Typography
                  variant="h1"
                  size={24}
                  lineHeight={32}
                  weight="bold"
                  align="center"
                  color={themeColors.text}
                >
                  {item.title}
                </Typography>

                <Typography
                  variant="body"
                  secondary
                  align="center"
                  style={styles.description}
                  color={themeColors.textSecondary}
                >
                  {item.description}
                </Typography>
              </View>
            </View>
          );
        }}
      />

      {/* Footer / Pagination & Main Button */}
      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {ONBOARDING_SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive
                      ? themeColors.primary
                      : themeColors.dot,
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        <Button
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={handleNext}
          textWeight="bold"
        />
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    position: "relative",
  },
  logoWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    marginTop: 64,
  },
  slide: {
    flex: 1,
    alignItems: "center",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  textContainer: {
    flex: 0.4,
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  description: {
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
