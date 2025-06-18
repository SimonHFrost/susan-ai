import React, { useEffect } from 'react';
import { Canvas, Circle, vec, Group } from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';
import { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  useDerivedValue,
  interpolate,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const SkiaAnimation = () => {
  const progress = useSharedValue(0);
  
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { 
        duration: 2000,
        easing: Easing.inOut(Easing.ease)
      }), 
      -1, 
      true
    );
  }, []);
  
  // Create a pulsing and rotating animation
  const radius = useDerivedValue(() => 
    interpolate(progress.value, [0, 1], [20, 40])
  );
  
  const rotation = useDerivedValue(() => 
    interpolate(progress.value, [0, 1], [0, Math.PI * 2])
  );
  
  const center = vec(width / 2, 100);
  
  return (
    <Canvas style={{ width: width, height: 200 }}>
      <Group transform={[{ rotate: rotation.value }]} origin={center}>
        <Circle
          cx={center.x}
          cy={center.y}
          r={radius}
          color="rgba(59, 130, 246, 0.6)"
        />
        <Circle
          cx={center.x}
          cy={center.y}
          r={useDerivedValue(() => radius.value * 0.6)}
          color="rgba(139, 69, 19, 0.8)"
        />
        <Circle
          cx={center.x}
          cy={center.y}
          r={useDerivedValue(() => radius.value * 0.3)}
          color="rgba(255, 255, 255, 0.9)"
        />
      </Group>
    </Canvas>
  );
}; 