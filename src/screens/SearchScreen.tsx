import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AnimeCard from '../components/AnimeCard';
import { Empty, JpTag, Scallop } from '../components/Decor';
import { searchAnime } from '../api';
import { C, F, R, shadow } from '../theme';
import { SavedAnime, toSaved } from '../types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [data, setData] = useState<SavedAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (q.trim().length < 2) {
      setData([]);
      setError('');
      return;
    }
    // espera a pessoa terminar de digitar
    const t = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        setData((await searchAnime(q.trim())).map(toSaved));
      } catch (e: any) {
        setError(e.message || 'Algo deu errado. Tente de novo.');
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [q]);

  const short = q.trim().length < 2;

  return (
    <View style={styles.page}>
      <View style={[styles.head, { paddingTop: insets.top + 10 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Buscar</Text>
          <JpTag text="検索" color={C.sakura} />
        </View>
        <View style={styles.box}>
          <Ionicons name="search" size={18} color={C.ink} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Procure um anime…"
            placeholderTextColor={C.muted}
            style={styles.input}
          />
          {loading && <ActivityIndicator size="small" color={C.matcha} />}
        </View>
      </View>
      <Scallop color={C.matchaSoft} />

      <FlatList
        style={{ marginTop: 16 }}
        data={data}
        numColumns={2}
        keyExtractor={(a) => String(a.mal_id)}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 22 }}
        contentContainerStyle={{ gap: 14, paddingBottom: 130, paddingTop: 6 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <AnimeCard item={item} />
          </View>
        )}
        ListHeaderComponent={
          error ? (
            <Empty emoji="🍨" text={error} />
          ) : short ? (
            <Empty emoji="🍵" text="Digite pelo menos 2 letras para buscar. さがそう!" />
          ) : !loading && data.length === 0 ? (
            <Empty emoji="🌸" text={`Nenhum anime encontrado para “${q}”.`} />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  head: { backgroundColor: C.matchaSoft, paddingHorizontal: 22, paddingBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontFamily: F.display, fontSize: 30, color: C.ink },
  box: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.paper, marginTop: 14,
    paddingHorizontal: 16, height: 50, borderRadius: R.pill, ...shadow,
  },
  input: { flex: 1, fontFamily: F.semi, fontSize: 15, color: C.ink },
});