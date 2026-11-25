import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { C, F, R } from '../theme';

export function Scallop({
  color,
  position = 'bottom',
  size = 26,
}: {
  color: string;
  position?: 'top' | 'bottom';
  size?: number;
}) {
  const { width } = useWindowDimensions();
  const count = Math.ceil(width / size) + 1;
  return (
    <View pointerEvents="none" style={{ height: size / 2, overflow: 'hidden', flexDirection: 'row' }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            marginTop: position === 'bottom' ? -size / 2 : 0,
          }}
        />
      ))}
    </View>
  );
}

// Bolha de cor decorativa
export function Blob({ size, color, style }: { size: number; color: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

// Etiqueta com texto em japonês
export function JpTag({ text, color = C.matcha }: { text: string; color?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.tagTxt}>{text}</Text>
    </View>
  );
}

// Tela vazia fofinha
export function Empty({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTxt}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: R.pill },
  tagTxt: { fontFamily: F.bold, fontSize: 12, color: C.ink },
  empty: { alignItems: 'center', marginTop: 36, paddingHorizontal: 36 },
  emptyEmoji: { fontSize: 54 },
  emptyTxt: { fontFamily: F.semi, color: C.muted, textAlign: 'center', marginTop: 10, lineHeight: 22 },
});