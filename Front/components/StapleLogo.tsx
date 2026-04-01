import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StrapleLogoProps {
  fontSize?: number;
}

export default function StapleLogo({ fontSize = 28 }: StrapleLogoProps) {
  const sSize = fontSize;
  const restSize = fontSize * 0.7;
  // Very subtle blue reflection — barely visible, like a faint blue glow/shadow
  const offset = Math.max(1, fontSize * 0.04);

  const sLift = fontSize * 0.15;

  return (
    <View style={styles.container}>
      {/* The "S" with subtle blue reflection — lifted above baseline */}
      <View style={{ width: sSize * 0.65, height: sSize * 1.15, marginBottom: sLift, marginLeft: -fontSize * 0.06 }}>
        {/* Faint blue reflection S — very subtle offset */}
        <Text
          style={[
            styles.letterS,
            {
              fontSize: sSize,
              color: 'rgba(86, 174, 255, 0.65)',
              position: 'absolute',
              top: -offset,
              left: -offset,
            },
          ]}
        >
          S
        </Text>
        {/* White main S on top */}
        <Text style={[styles.letterS, { fontSize: sSize, color: '#FFFFFF' }]}>
          S
        </Text>
      </View>

      {/* "traple" in lowercase — smaller than the S */}
      <Text style={[styles.rest, { fontSize: restSize, lineHeight: sSize * 1.15, marginLeft: -1 }]}>traple</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  letterS: {
    fontFamily: 'BukhariScript',
    includeFontPadding: false,
  },
  rest: {
    fontFamily: 'BukhariScript',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
