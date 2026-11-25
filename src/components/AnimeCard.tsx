import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, F, R, shadow } from '../theme';
import { RootStack, SavedAnime } from '../types';
import { useStore } from '../store';

export default function AnimeCard({ item, width, tilt = 0 }: { item: SavedAnime; width?: number; tilt?: number }) {
  const nav = useNavigation<NativeStackNavigationProp<RootStack>>();
  const { isFav, toggleFav } = useStore();
  const fav = isFav(item.mal_id);

  return (
    <Pressable
      onPress={() => nav.navigate('Details', { id: item.mal_id, preview: item })}
      style={[styles.card, width ? { width } : { flex: 1 }, { transform: [{ rotate: `${tilt}deg` }] }]}
    >
      <Image source={{ uri: item.image }} style={styles.img} />
      <Pressable hitSlop={8} onPress={() => toggleFav(item)} style={styles.heart}>
        <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={fav ? '#E2736B' : C.ink} />
      </Pressable>
      {item.score ? (
        <View style={styles.score}>
          <Ionicons name="star" size={11} color={C.ink} />
          <Text style={styles.scoreTxt}>{item.score.toFixed(1)}</Text>
        </View>
      ) : null}
      <Text numberOfLines={2} style={styles.title}>
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.paper, borderRadius: R.lg, padding: 8, ...shadow },
  img: { width: '100%', aspectRatio: 0.71, borderRadius: R.md, backgroundColor: C.sakuraSoft },
  heart: {
    position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center',
  },
  score: {
    position: 'absolute', left: 14, bottom: 58, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.matchaSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill,
  },
  scoreTxt: { fontFamily: F.bold, fontSize: 11, color: C.ink },
  title: {
    fontFamily: F.displayBold, fontSize: 13, color: C.ink, textAlign: 'center',
    marginTop: 8, marginHorizontal: 4, minHeight: 34,
  },
});