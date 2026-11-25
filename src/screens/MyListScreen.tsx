import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AnimeCard from '../components/AnimeCard';
import { Empty, JpTag, Scallop } from '../components/Decor';
import { useStore } from '../store';
import { C, F, R, shadow } from '../theme';
import { RootStack, WatchingAnime } from '../types';

function WatchingRow({ item }: { item: WatchingAnime }) {
  const nav = useNavigation<NativeStackNavigationProp<RootStack>>();
  const { setEpisode, toggleWatching } = useStore();
  const pct = item.episodes ? Math.min(100, (item.episode / item.episodes) * 100) : 0;

  return (
    <Pressable style={styles.row} onPress={() => nav.navigate('Details', { id: item.mal_id, preview: item })}>
      <Image source={{ uri: item.image }} style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowEp}>
          Episódio {item.episode}
          {item.episodes ? ` de ${item.episodes}` : ''}
        </Text>
        {item.episodes ? (
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        ) : null}
        <View style={styles.actions}>
          <Pressable style={styles.round} onPress={() => setEpisode(item.mal_id, item.episode - 1)}>
            <Ionicons name="remove" size={18} color={C.ink} />
          </Pressable>
          <Pressable style={[styles.round, { backgroundColor: C.matcha }]} onPress={() => setEpisode(item.mal_id, item.episode + 1)}>
            <Ionicons name="add" size={18} color={C.ink} />
          </Pressable>
          <Pressable style={styles.done} onPress={() => toggleWatching(item)}>
            <Text style={styles.doneTxt}>Parar</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function MyListScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, watching } = useStore();
  const [tab, setTab] = useState<'fav' | 'watch'>('watch');

  return (
    <View style={styles.page}>
      <View style={[styles.head, { paddingTop: insets.top + 10 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Minha lista</Text>
          <JpTag text={tab === 'watch' ? '視聴中' : 'お気に入り'} color={C.matchaSoft} />
        </View>
        <View style={styles.seg}>
          {([['watch', `Assistindo (${watching.length})`], ['fav', `Favoritos (${favorites.length})`]] as const).map(([k, label]) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[styles.segBtn, tab === k && styles.segOn]}>
              <Text style={styles.segTxt}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Scallop color={C.sakura} />

      {tab === 'watch' ? (
        <FlatList
          key="watching"
          style={{ marginTop: 16 }}
          data={watching}
          keyExtractor={(a) => String(a.mal_id)}
          contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 6, gap: 14, paddingBottom: 130 }}
          renderItem={({ item }) => <WatchingRow item={item} />}
          ListEmptyComponent={<Empty emoji="🍵" text="Você ainda não está assistindo nada. Abra um anime e toque em “Estou assistindo”." />}
        />
      ) : (
        <FlatList
          key="favorites"
          style={{ marginTop: 16 }}
          data={favorites}
          numColumns={2}
          keyExtractor={(a) => String(a.mal_id)}
          columnWrapperStyle={{ gap: 14, paddingHorizontal: 22 }}
          contentContainerStyle={{ gap: 14, paddingTop: 6, paddingBottom: 130 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <AnimeCard item={item} />
            </View>
          )}
          ListEmptyComponent={<Empty emoji="🌸" text="Nenhum favorito ainda. Toque no coração de um anime para guardar." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  head: { backgroundColor: C.sakura, paddingHorizontal: 22, paddingBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontFamily: F.display, fontSize: 30, color: C.ink },
  seg: { flexDirection: 'row', backgroundColor: C.paper, marginTop: 14, padding: 4, borderRadius: R.pill },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: R.pill, alignItems: 'center' },
  segOn: { backgroundColor: C.matchaSoft },
  segTxt: { fontFamily: F.bold, color: C.ink, fontSize: 13 },
  row: { flexDirection: 'row', gap: 14, backgroundColor: C.paper, padding: 12, borderRadius: R.lg, ...shadow },
  thumb: { width: 84, height: 120, borderRadius: R.md, backgroundColor: C.sakuraSoft },
  rowTitle: { fontFamily: F.displayBold, fontSize: 15, color: C.ink },
  rowEp: { fontFamily: F.semi, fontSize: 12, color: C.muted, marginTop: 4 },
  bar: { height: 9, borderRadius: 5, backgroundColor: C.sakuraSoft, marginTop: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.matcha, borderRadius: 5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto' },
  round: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  done: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 7, borderRadius: R.pill, backgroundColor: C.sakura },
  doneTxt: { fontFamily: F.bold, fontSize: 12, color: C.ink },
});