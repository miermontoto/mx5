import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, PanResponder, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants';

const TOTAL_FRAMES = 36;
const BASE_URL = 'https://cgi.cdn.mazda.media/compressed/26bea936443b835f96043aa46c670a3df8c6d3df71e27f936422b9b1f7badcbf/MERGED';

interface CarAnimationProps {
  size?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export const CarAnimation: React.FC<CarAnimationProps> = ({
  size = 200,
  autoRotate = false,
  rotationSpeed = 3000
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastX = useRef(0);

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      const loadPromises = [];
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const imageUrl = `${BASE_URL}/${i}/36.jpg`;
        loadPromises.push(
          Image.prefetch(imageUrl).then(() => {
            setLoadedImages(prev => ({ ...prev, [i]: true }));
          })
        );
      }

      await Promise.all(loadPromises);
      setImagesLoaded(true);
    };

    preloadImages();
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (autoRotate && imagesLoaded) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev % TOTAL_FRAMES) + 1);
      }, rotationSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRotate, rotationSpeed, imagesLoaded]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        lastX.current = evt.nativeEvent.pageX;
      },
      onPanResponderMove: (evt) => {
        const currentX = evt.nativeEvent.pageX;
        const deltaX = currentX - lastX.current;

        // Calculate frame change based on swipe distance
        const sensitivity = 5; // Lower = more sensitive
        const frameChange = Math.round(deltaX / sensitivity);

        if (frameChange !== 0) {
          setCurrentFrame(prev => {
            let newFrame = prev - frameChange;
            // Wrap around
            if (newFrame < 1) newFrame = TOTAL_FRAMES + (newFrame % TOTAL_FRAMES);
            if (newFrame > TOTAL_FRAMES) newFrame = newFrame % TOTAL_FRAMES || TOTAL_FRAMES;
            return newFrame;
          });
          lastX.current = currentX;
        }
      },
    })
  ).current;

  if (!imagesLoaded) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator size="large" color={COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.imageWrapper, { width: size, height: size }]}>
        <Image
          source={{ uri: `${BASE_URL}/${currentFrame}/36.jpg` }}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: 'transparent',
  },
});
