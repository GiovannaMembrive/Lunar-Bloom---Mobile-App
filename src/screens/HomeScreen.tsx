import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AnimeCard from '../components/AnimeCard';
import { Blob, JpTag, Scallop } from '../components/Decor';
import { getCurated, getSeasonNow } from '../api';
import { useStore } from '../store';
import { C, F, R, shadow } from '../theme';
import { RootStack, SavedAnime, toSaved } from '../types';

function Heading({ title, jp, jpColor, loading }: { title: string; jp: string; jpColor: string; loading: boolean }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.h2}>{title}</Text>
      <JpTag text={jp} color={jpColor} />
      {loading && <ActivityIndicator size="small" color={C.ink} />}
    </View>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStack>>();
  const insets = useSafeAreaInsets();
  const { watching } = useStore();
  const [picks, setPicks] = useState<SavedAnime[]>([]);
  const [season, setSeason] = useState<SavedAnime[]>([]);
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [loadingSeason, setLoadingSeason] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setError('');
    setLoadingPicks(true);
    setLoadingSeason(true);

    getCurated()
      .then((list) => alive && setPicks(list.map(toSaved)))
      .catch((e) => alive && setError(e?.message || 'Não foi possível carregar os animes.'))
      .finally(() => alive && setLoadingPicks(false));

    getSeasonNow()
      .then((list) => alive && setSeason(list.map(toSaved)))
      .catch(() => {})
      .finally(() => alive && setLoadingSeason(false));

    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = () => {
    setPicks([]);
    setSeason([]);
    setAttempt((n) => n + 1);
  };

  const next = watching[0];

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      {/* Topo creme com borda ondulada */}
      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <View style={{ gap: 6 }}>
            <JpTag text="ようこそ" color={C.matchaSoft} />
            <Text style={styles.brand}>Lunar Bloom</Text>
          </View>
          <View style={styles.moon}>
            <Ionicons name="moon" size={20} color={C.ink} />
          </View>
        </View>

        <View style={styles.heroBody}>
          <View style={{ flex: 1, zIndex: 2 }}>
            <Text style={styles.heroTitle}>Um docinho{'\n'}de anime.</Text>
            <Text style={styles.heroSub}>Salve favoritos, acompanhe episódios e descubra novidades.</Text>
            <Pressable style={styles.heroBtn} onPress={() => (nav as any).navigate('Tabs', { screen: 'Buscar' })}>
              <Text style={styles.heroBtnTxt}>Explorar →</Text>
            </Pressable>
          </View>

          <View style={styles.mascotWrap}>
            <Blob size={170} color={C.sakura} style={{ right: -10, top: 30 }} />
            <Blob size={50} color={C.matchaSoft} style={{ left: -6, bottom: 20 }} />
            <Image source={require('../../assets/sakura.png')} style={styles.mascot} resizeMode="contain" />
          </View>
        </View>
      </View>
      <Scallop color={C.cream} />

      {/* Tíquete: continuar assistindo */}
      {next && (
        <Pressable style={styles.ticket} onPress={() => nav.navigate('Details', { id: next.mal_id, preview: next })}>
          <JpTag text="つづきから" color={C.matchaSoft} />
          <Text numberOfLines={2} style={styles.ticketTitle}>{next.title}</Text>
          <View style={styles.dash} />
          <View style={styles.ticketRow}>
            <Text style={styles.ticketEp}>Episódio {next.episode}</Text>
            <Text style={styles.stars}>★ ★ ★</Text>
          </View>
        </Pressable>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Não deu para carregar os animes</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <Pressable style={styles.heroBtn} onPress={retry}>
            <Text style={styles.heroBtnTxt}>Tentar de novo</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Faixa matcha com cards inclinados */}
      <View style={styles.bandWrap}>
        <Scallop color={C.matcha} position="top" />
        <View style={styles.band}>
          <Heading title="Seleção fofinha" jp="おすすめ" jpColor={C.cream} loading={loadingPicks} />
          <FlatList
            horizontal
            data={picks}
            keyExtractor={(a) => String(a.mal_id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 18, gap: 14 }}
            renderItem={({ item, index }) => <AnimeCard item={item} width={140} tilt={index % 2 ? 3 : -4} />}
          />
        </View>
        <Scallop color={C.matcha} />
      </View>

      {/* Temporada */}
      <View style={styles.season}>
        <Blob size={180} color={C.cream} style={{ right: -60, top: -10 }} />
        <Heading title="No ar agora" jp="今期" jpColor={C.matchaSoft} loading={loadingSeason} />
        <FlatList
          horizontal
          data={season}
          keyExtractor={(a) => String(a.mal_id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 14, gap: 14 }}
          renderItem={({ item }) => <AnimeCard item={item} width={140} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  hero: { backgroundColor: C.cream, paddingHorizontal: 22, paddingBottom: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: F.display, fontSize: 26, color: C.ink },
  moon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.sakura, alignItems: 'center', justifyContent: 'center' },
  heroBody: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  heroTitle: { fontFamily: F.display, fontSize: 30, lineHeight: 35, color: C.ink },
  heroSub: { fontFamily: F.semi, fontSize: 13, color: C.ink, marginTop: 10, lineHeight: 19 },
  heroBtn: { alignSelf: 'flex-start', backgroundColor: C.ink, paddingHorizontal: 20, paddingVertical: 11, borderRadius: R.pill, marginTop: 16 },
  heroBtnTxt: { fontFamily: F.bold, color: C.cream, fontSize: 13 },

  mascotWrap: { width: 175, height: 240, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  mascot: { width: 175, height: 240, transform: [{ rotate: '4deg' }] },

  ticket: {
    backgroundColor: C.paper, marginHorizontal: 28, marginTop: 30, padding: 18, borderRadius: 14,
    borderWidth: 2, borderStyle: 'dashed', borderColor: C.sakura, transform: [{ rotate: '-2deg' }], ...shadow,
  },
  ticketTitle: { fontFamily: F.display, fontSize: 20, color: C.ink, marginTop: 8 },
  dash: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: C.sakura, marginVertical: 12 },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketEp: { fontFamily: F.bold, color: C.ink, fontSize: 13 },
  stars: { color: C.matcha, fontSize: 14 },

  errorBox: { backgroundColor: C.paper, margin: 22, padding: 18, borderRadius: R.lg, alignItems: 'center', ...shadow },
  errorTitle: { fontFamily: F.displayBold, fontSize: 16, color: C.ink },
  errorMsg: { fontFamily: F.semi, color: C.muted, textAlign: 'center', marginTop: 6 },

  bandWrap: { marginTop: 40 },
  band: { backgroundColor: C.matcha, paddingVertical: 28 },
  season: { marginTop: 44, overflow: 'hidden' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22 },
  h2: { fontFamily: F.display, fontSize: 21, color: C.ink },
});