import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

export default function MadeByFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>Made by Yogesh</Text>
      <Text style={styles.copyright}>© 2026 Yogesh · UNO Multiplayer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 24 },
  name: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  copyright: { color: Colors.textMuted, fontSize: 10, marginTop: 8 },
});
