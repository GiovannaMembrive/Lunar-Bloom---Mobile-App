import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Blob, JpTag } from '../components/Decor';
import { getAnime } from '../api';
import { useStore } from '../store';
import { C, F, R, shadow } from '../theme';
import { Anime, RootStack, toSaved } from '../types';

const CHIP_COLORS = [C.matchaSoft, C.sakura, C.cream];

export default function DetailsScreen({ route, navigation }: NativeStackScreenProps<RootStack, 'Details'>) {
  const { id, preview } = route.params;
  const insets = useSafeAreaInsets();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [error, setError] = useState('');
  const { isFav, isWatching, toggleFav, toggleWatching } = useStore();

  useEffect(() => {
    getAnime(id).then(setAnime).catch((e) => setError(e.message || 'Não foi possível carregar.'));
  }, [id]);

  const saved = anime ? toSaved(anime) : preview;
  const fav = isFav(id);
  const watching = isWatching(id);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
          <Blob size={300} color={C.sakura} style={{ right: -90, top: -90 }} />
          <Blob size={150} color={C.matchaSoft} style={{ left: -50, top: 150 }} />
          <View style={styles.bar}>
            <Pressable style={styles.round} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={C.ink} />
            </Pressable>
            <Pressable style={styles.round} onPress={() => saved && toggleFav(saved)}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#E2736B' : C.ink} />
            </Pressable>
          </View>
          {saved && (
            <View style={styles.polaroid}>
              <Image source={{ uri: saved.image }} style={styles.poster} />
            </View>
          )}
        </View>

        <View style={styles.body}>
          <JpTag text="アニメ" color={C.matchaSoft} />
          <Text style={styles.title}>{saved?.title}</Text>

          {!anime && !error && <ActivityIndicator color={C.matcha} style={{ marginTop: 24 }} />}
          {error ? <Text style={styles.err}>{error}</Text> : null}

          {anime && (
            <>
              <View style={styles.stats}>
                <Stat icon="star" label={anime.score ? anime.score.toFixed(1) : '—'} color={C.matchaSoft} />
                <Stat icon="film" label={anime.episodes ? `${anime.episodes} eps` : 'Em aberto'} color={C.sakura} />
                <Stat icon="calendar" label={anime.year ? String(anime.year) : '—'} color={C.cream} />
              </View>

              <View style={styles.chips}>
                {anime.genres.map((g, i) => (
                  <View key={g.mal_id} style={[styles.chip, { backgroundColor: CHIP_COLORS[i % 3] }]}>
                    <Text style={styles.chipTxt}>{g.name}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => saved && toggleWatching(saved)}
                style={[styles.cta, watching && { backgroundColor: C.sakura }]}
              >
                <Ionicons name={watching ? 'checkmark-circle' : 'play'} size={18} color={C.ink} />
                <Text style={styles.ctaTxt}>{watching ? 'Assistindo agora' : 'Estou assistindo'}</Text>
                <Text style={styles.ctaJp}>{watching ? '視聴中' : ''}</Text>
              </Pressable>

              <View style={styles.synCard}>
                <View style={styles.synHead}>
                  <Text style={styles.h2}>Sinopse</Text>
                  <JpTag text="あらすじ" color={C.sakura} />
                </View>
                <Text style={styles.synopsis}>{anime.synopsis || 'Sem sinopse disponível.'}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: color }]}>
      <Ionicons name={icon} size={15} color={C.ink} />
      <Text style={styles.statTxt}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  top: {
    backgroundColor: C.cream, alignItems: 'center', paddingBottom: 30, overflow: 'hidden',
    borderBottomLeftRadius: 44, borderBottomRightRadius: 44,
  },
  bar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  round: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center', ...shadow },
  polaroid: { marginTop: 8, padding: 8, backgroundColor: C.paper, borderRadius: 22, transform: [{ rotate: '-3deg' }], ...shadow },
  poster: { width: 180, height: 255, borderRadius: 16, backgroundColor: C.sakuraSoft },
  body: { paddingHorizontal: 22, paddingTop: 22, alignItems: 'center' },
  title: { fontFamily: F.display, fontSize: 28, lineHeight: 32, color: C.ink, textAlign: 'center', marginTop: 10 },
  err: { fontFamily: F.semi, color: C.ink, textAlign: 'center', marginTop: 20 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 18 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.pill },
  statTxt: { fontFamily: F.bold, color: C.ink, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.pill },
  chipTxt: { fontFamily: F.bold, fontSize: 12, color: C.ink },
  cta: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch',
    backgroundColor: C.matcha, height: 54, borderRadius: R.pill, marginTop: 22, ...shadow,
  },
  ctaTxt: { fontFamily: F.black, color: C.ink, fontSize: 15 },
  ctaJp: { fontFamily: F.bold, color: C.ink, fontSize: 12 },
  synCard: {
    alignSelf: 'stretch', backgroundColor: C.paper, borderRadius: R.lg, padding: 18, marginTop: 24,
    borderWidth: 2, borderStyle: 'dashed', borderColor: C.matcha,
  },
  synHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  h2: { fontFamily: F.display, fontSize: 19, color: C.ink },
  synopsis: { fontFamily: F.regular, fontSize: 14, color: C.ink, lineHeight: 22, marginTop: 10 },
});