import React, { useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { CardColor } from '@uno/shared';
import ElementalBackground from '../components/ui/ElementalBackground';
import NumberCard from '../components/cards/NumberCard';
import WildCard from '../components/cards/WildCard';
import DrawTwoCard from '../components/cards/DrawTwoCard';
import CardBack from '../components/cards/CardBack';

const FONT = 'LuckiestGuy_400Regular';

const FEATURES = [
  { icon: '⚡', title: 'Real-Time Multiplayer', desc: 'Play live with friends or spar against bots — rooms for up to 10 players.', accent: Colors.red },
  { icon: '🃏', title: 'Official Rules', desc: 'The full 112-card deck: challenges, swap & shuffle hands, 7-0, jump-in.', accent: Colors.yellow },
  { icon: '🎨', title: 'House Rules', desc: 'Stack draw twos, force play, alternate scoring — tune every table.', accent: Colors.green },
  { icon: '📱', title: 'Any Screen', desc: 'Phone, tablet or desktop browser. A table that fits every screen.', accent: Colors.blue },
];

const STEPS = [
  { n: '1', title: 'Create a room', desc: 'Pick a name and avatar, then create a room or join with a 6-letter code.' },
  { n: '2', title: 'Match the top card', desc: 'Play a card with the same color, number or symbol. Action cards flip the game.' },
  { n: '3', title: 'Use your powers', desc: 'Skip, reverse, draw two, wilds and hand swaps — and challenge a suspicious +4.' },
  { n: '4', title: 'Call UNO & win', desc: 'Shout UNO on your last card, catch others who forget, race to the score target.' },
];

// ---------------------------------------------------------------------------
// Floating card with gentle drift
// ---------------------------------------------------------------------------
function FloatingCard({ index, card, w, h, rotate }: {
  index: number; card: React.ReactNode; w: number; h: number; rotate: string;
}) {
  const bob = useSharedValue(0);

  React.useEffect(() => {
    bob.value = withDelay(index * 400, withRepeat(
      withSequence(
        withTiming(-6, { duration: 2200 + index * 200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200 + index * 200, easing: Easing.inOut(Easing.sin) }),
      ), -1, true
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <Animated.View style={[styles.floatWrap, { width: w, height: h, transform: [{ rotate }] }]}>
      <Animated.View style={style}>{card}</Animated.View>
    </Animated.View>
  );
}

function HeroCard({ index, color, value, type, w, h }: {
  index: number; color: string; value?: number; type: 'number' | 'wild' | 'draw2'; w: number; h: number;
}) {
  const card = type === 'wild' ? (
    <WildCard width={w} height={h} borderRadius={Math.round(w * 0.14)} />
  ) : type === 'draw2' ? (
    <DrawTwoCard color={color} width={w} height={h} borderRadius={Math.round(w * 0.14)} />
  ) : (
    <NumberCard color={color} value={value ?? 0} width={w} height={h} borderRadius={Math.round(w * 0.14)} />
  );
  return <FloatingCard index={index} card={card} w={w} h={h} rotate={`${(index - 2) * 12}deg`} />;
}

// ---------------------------------------------------------------------------
// Interactive table preview
// ---------------------------------------------------------------------------
function TableMockup() {
  const cw = 60;
  const ch = Math.round(cw * (10 / 7));

  return (
    <View style={styles.tableStadiumOuter}>
      {/* Stadium Leather/Wood Rim */}
      <View style={styles.tableStadiumRim}>
        <LinearGradient
          colors={['#0E3326', '#081F17', '#04100C']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.tableFelt}
        >
          {/* Top Live Match Header */}
          <View style={styles.tableTopHeader}>
            <View style={styles.tableLiveBadge}>
              <View style={styles.tableLiveDot} />
              <Text style={styles.tableLiveText}>LIVE MULTIPLAYER MATCH</Text>
            </View>
            <View style={styles.tableTurnBadge}>
              <Text style={styles.tableTurnText}>⚡ Momo's Turn</Text>
            </View>
          </View>

          {/* Opponents Row */}
          <View style={styles.mockOpponents}>
            {[
              { avatar: '🦊', name: 'Rina', n: 6, active: false },
              { avatar: '🐼', name: 'Momo', n: 4, active: true },
              { avatar: '🦁', name: 'Kai', n: 9, active: false },
            ].map((p) => (
              <View key={p.name} style={[styles.mockOppPod, p.active && styles.mockOppPodActive]}>
                <View style={[styles.mockAvatar, p.active && styles.mockAvatarActive]}>
                  <Text style={styles.mockAvatarText}>{p.avatar}</Text>
                  {p.active && <View style={styles.activeTurnPulse} />}
                </View>
                <View style={styles.mockPodInfo}>
                  <Text style={styles.mockName}>{p.name}</Text>
                  <View style={styles.mockCountPill}>
                    <Text style={styles.mockCountText}>{p.n} CARDS</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Table Centerfelt: Draw Pile | Direction | Discard Pile */}
          <View style={styles.mockCenter}>
            {/* Draw Pile */}
            <View style={styles.mockDrawWrap}>
              {[2, 1, 0].map((o) => (
                <View key={o} style={{ position: 'absolute', top: -o * 2.5, left: o * 1.5 }}>
                  <CardBack width={cw} height={ch} borderRadius={9} />
                </View>
              ))}
              <View style={styles.drawCountBadge}>
                <Text style={styles.drawCountText}>84</Text>
              </View>
            </View>

            {/* Direction Indicator */}
            <View style={styles.mockDirectionRing}>
              <Text style={styles.mockArrow}>↻</Text>
              <Text style={styles.mockDirectionLabel}>CLOCKWISE</Text>
            </View>

            {/* Discard Pile with Red 7 */}
            <View style={styles.mockDiscardWrap}>
              <View style={styles.discardGlowHalo} />
              <View style={{ transform: [{ rotate: '-4deg' }] }}>
                <NumberCard color={CardColor.RED} value={7} width={cw} height={ch} borderRadius={9} />
              </View>
            </View>
          </View>

          {/* Player Hand Section (You) */}
          <View style={styles.playerHandSection}>
            <View style={styles.playerHandLabelRow}>
              <Text style={styles.playerHandLabel}>YOU (4 Cards)</Text>
              <Text style={styles.playerHandHint}>Tap card to play</Text>
            </View>

            <View style={styles.mockHand}>
              <View style={styles.mockCardSlot}>
                <NumberCard color={CardColor.GREEN} value={3} width={cw} height={ch} borderRadius={9} />
              </View>
              <View style={[styles.mockCardSlot, { marginLeft: -cw * 0.32 }]}>
                <NumberCard color={CardColor.YELLOW} value={9} width={cw} height={ch} borderRadius={9} />
              </View>
              <View style={[styles.mockCardSlot, { marginLeft: -cw * 0.32 }]}>
                <WildCard width={cw} height={ch} borderRadius={9} />
              </View>
              {/* Playable +2 card with highlight lift */}
              <View style={[styles.mockCardSlot, styles.playableCardSlot, { marginLeft: -cw * 0.32 }]}>
                <DrawTwoCard color={CardColor.BLUE} width={cw} height={ch} borderRadius={9} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Landing Screen
// ---------------------------------------------------------------------------
export default function LandingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 760;


  const scrollToHowTo = () => {
    scrollRef.current?.scrollTo({ y: isWide ? 1150 : 1300, animated: true });
  };

  const fanW = Math.min(68, width * 0.15);
  const fanH = Math.round(fanW * (10 / 7));

  const goPlay = () => router.push('/home');

  return (
    <View style={styles.container}>
      <ElementalBackground variant="embers" />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HERO ================= */}
        <View style={[styles.hero, { minHeight: isWide ? 580 : 500 }]}>
          <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.heroInner}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MULTIPLAYER CARD GAME</Text>
            </View>

            <View style={styles.logoRow}>
              <Text style={[styles.logoLetter, styles.logoRed]}>U</Text>
              <Text style={[styles.logoLetter, styles.logoYellow]}>N</Text>
              <Text style={[styles.logoLetter, styles.logoBlue]}>O</Text>
            </View>

            <Text style={styles.tagline}>THE CLASSIC CARD GAME — REIMAGINED</Text>

            <View style={styles.ctaRow}>
              <Pressable onPress={goPlay} style={[styles.ctaWrap, { flex: isWide ? 0 : 1 }]}>
                <LinearGradient
                  colors={['#E8364B', '#A0182A']}
                  style={styles.primaryCta}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryCtaText}>▶  PLAY NOW</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={scrollToHowTo} style={[styles.secondaryCta, { flex: isWide ? 0 : 1 }]}>
                <Text style={styles.secondaryCtaText}>How to Play</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              {['10 PLAYERS', '112 CARDS', 'ONLINE'].map((s) => (
                <View key={s} style={styles.statChip}><Text style={styles.statText}>{s}</Text></View>
              ))}
            </View>
          </Animated.View>

          {/* Hero card fan */}
          <Animated.View entering={FadeInUp.delay(380).duration(600)} style={styles.fanRow}>
            <HeroCard index={0} color={CardColor.YELLOW} value={5} type="number" w={fanW} h={fanH} />
            <HeroCard index={1} color={CardColor.GREEN} value={2} type="number" w={fanW} h={fanH} />
            <HeroCard index={2} color={CardColor.RED} value={7} type="number" w={fanW} h={fanH} />
            <HeroCard index={3} color={CardColor.BLUE} value={9} type="number" w={fanW} h={fanH} />
            <HeroCard index={4} color={CardColor.WILD} type="wild" w={fanW} h={fanH} />
          </Animated.View>
        </View>

        {/* ================= LIVE TABLE ================= */}
        <View style={[styles.section, { maxWidth: 860 }]}>
          <Animated.View entering={FadeInUp.delay(120).duration(450)} style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>LIVE PREVIEW</Text>
            <Text style={styles.sectionTitle}>It plays like the real deck.</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <TableMockup />
          </Animated.View>
        </View>

        {/* ================= FEATURES ================= */}
        <View style={[styles.section, { maxWidth: 960 }]}>
          <Animated.View entering={FadeInUp.delay(120).duration(450)} style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>FEATURES</Text>
            <Text style={styles.sectionTitle}>Everything the real card game has.</Text>
          </Animated.View>
          <View style={[styles.grid, isWide && styles.gridWide]}>
            {FEATURES.map((f, i) => (
              <Animated.View key={f.title} entering={FadeInUp.delay(180 + i * 80).duration(400)} style={[styles.featureCard, isWide && styles.featureCardWide]}>
                <View style={[styles.featureIcon, { backgroundColor: f.accent + '18' }]}>
                  <Text style={styles.featureIconText}>{f.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ================= HOW TO PLAY ================= */}
        <View style={[styles.section, { maxWidth: 960 }]}>
          <Animated.View entering={FadeInUp.delay(120).duration(450)} style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>HOW TO PLAY</Text>
            <Text style={styles.sectionTitle}>Four steps to your first win.</Text>
          </Animated.View>
          <View style={[styles.stepsRow, isWide && styles.stepsRowWide]}>
            {STEPS.map((s, i) => (
              <Animated.View key={s.n} entering={FadeInUp.delay(180 + i * 80).duration(400)} style={[styles.stepCard, isWide && styles.stepCardWide]}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{s.n}</Text>
                </View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ================= CTA BAND ================= */}
        <View style={[styles.section, { maxWidth: 860 }]}>
          <Animated.View entering={FadeInUp.delay(180).duration(500)}>
            <LinearGradient
              colors={['#E8364B', '#A0182A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBand}
            >
              <Text style={styles.ctaBandTitle}>Ready to play?</Text>
              <Text style={styles.ctaBandSub}>Create a room, invite your friends, and let the chaos begin.</Text>
              <Pressable onPress={goPlay} style={styles.ctaBandBtn}>
                <Text style={styles.ctaBandBtnText}>START PLAYING →</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* ================= FOOTER ================= */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>A fan-made tribute · Not affiliated with or endorsed by Mattel.</Text>
          <Text style={styles.footerSmall}>UNO is a trademark of Mattel.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },

  // ---- Hero ----
  hero: {
    width: '100%', justifyContent: 'flex-start', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 60, position: 'relative',
  },
  heroInner: { alignItems: 'center', maxWidth: 620, width: '100%' },
  badge: {
    backgroundColor: 'rgba(232,54,75,0.10)', borderWidth: 1, borderColor: 'rgba(232,54,75,0.30)',
    borderRadius: 999, paddingHorizontal: 18, paddingVertical: 7,
  },
  badgeText: { color: Colors.red, fontSize: 11, fontWeight: '700', letterSpacing: 3 },

  logoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  logoLetter: {
    fontFamily: FONT, fontSize: 100, lineHeight: 104,
    textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 20,
  },
  logoRed: { color: Colors.red, textShadowColor: 'rgba(232,54,75,0.4)' },
  logoYellow: { color: Colors.yellow, textShadowColor: 'rgba(245,184,0,0.4)', marginHorizontal: -6 },
  logoBlue: { color: Colors.blue, textShadowColor: 'rgba(43,139,245,0.4)' },

  tagline: {
    color: Colors.textSecondary, fontSize: 11, fontWeight: '700',
    letterSpacing: 5, marginTop: 10,
  },

  ctaRow: { flexDirection: 'row', gap: 12, marginTop: 28, justifyContent: 'center', flexWrap: 'wrap' },
  ctaWrap: { minWidth: 190 },
  primaryCta: {
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 28, alignItems: 'center',
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  primaryCtaText: { color: Colors.white, fontFamily: FONT, fontSize: 20, letterSpacing: 1.5, textAlign: 'center' },
  secondaryCta: {
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,220,180,0.15)', backgroundColor: 'rgba(28,22,30,0.7)',
    justifyContent: 'center',
  },
  secondaryCtaText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 8, marginTop: 22, flexWrap: 'wrap', justifyContent: 'center' },
  statChip: {
    backgroundColor: 'rgba(255,220,180,0.06)', borderWidth: 1, borderColor: 'rgba(255,220,180,0.10)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 5,
  },
  statText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  floatWrap: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },

  fanRow: { flexDirection: 'row', marginTop: 46, justifyContent: 'center', paddingHorizontal: 28 },

  // ---- Sections ----
  section: { width: '100%', paddingHorizontal: 24, paddingTop: 72, alignSelf: 'center' },
  sectionHead: { marginBottom: 24 },
  sectionLabel: { color: Colors.metallicGold, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },

  // ---- Stadium Table Mockup ----
  tableStadiumOuter: {
    padding: 6,
    borderRadius: 36,
    backgroundColor: '#1E1610',
    borderWidth: 2,
    borderColor: '#3D2A1A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 16,
  },
  tableStadiumRim: {
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#6B4E2B',
    overflow: 'hidden',
  },
  tableFelt: {
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tableTopHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  tableLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tableLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  tableLiveText: {
    color: '#00E676',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tableTurnBadge: {
    backgroundColor: 'rgba(255,186,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFBA0040',
  },
  tableTurnText: {
    color: '#FFD400',
    fontSize: 10,
    fontWeight: '800',
  },
  mockOpponents: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
    width: '100%',
  },
  mockOppPod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.40)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mockOppPodActive: {
    borderColor: '#FFD40080',
    backgroundColor: 'rgba(255,186,0,0.10)',
  },
  mockAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockAvatarActive: {
    borderWidth: 2,
    borderColor: '#FFD400',
  },
  activeTurnPulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD400',
  },
  mockAvatarText: { fontSize: 16 },
  mockPodInfo: { alignItems: 'flex-start' },
  mockName: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  mockCountPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  mockCountText: { color: '#FFD400', fontSize: 8, fontWeight: '800' },
  mockCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginVertical: 6,
  },
  mockDrawWrap: { width: 60, height: 86, justifyContent: 'center' },
  drawCountBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#0E1714',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  drawCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  mockDirectionRing: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  mockArrow: { color: '#FFD400', fontSize: 24, fontWeight: '900' },
  mockDirectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: '800', marginTop: 2 },
  mockDiscardWrap: { width: 60, height: 86, justifyContent: 'center', alignItems: 'center' },
  discardGlowHalo: {
    position: 'absolute',
    width: 70,
    height: 96,
    borderRadius: 14,
    backgroundColor: 'rgba(237,28,36,0.20)',
    shadowColor: '#ED1C24',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  playerHandSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  playerHandLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  playerHandLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  playerHandHint: { color: '#00E676', fontSize: 10, fontWeight: '700' },
  mockHand: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    minHeight: 96,
  },
  mockCardSlot: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  playableCardSlot: {
    transform: [{ translateY: -10 }],
    shadowColor: '#00E676',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },

  // ---- Features ----
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { justifyContent: 'space-between' },
  featureCard: {
    flexBasis: '100%',
    backgroundColor: 'rgba(28,22,30,0.60)', borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: 'rgba(255,220,180,0.08)',
  },
  featureCardWide: { flexBasis: '48%', flexGrow: 1 },
  featureIcon: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  featureIconText: { fontSize: 22 },
  featureTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  featureDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },

  // ---- How to play ----
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stepsRowWide: { justifyContent: 'space-between' },
  stepCard: {
    flexBasis: '100%',
    backgroundColor: 'rgba(28,22,30,0.60)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,220,180,0.08)',
  },
  stepCardWide: { flexBasis: '22%', flexGrow: 1 },
  stepNumber: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    backgroundColor: 'rgba(232,54,75,0.12)', borderWidth: 1, borderColor: 'rgba(232,54,75,0.25)',
  },
  stepNumberText: { color: Colors.red, fontSize: 17, fontWeight: '800' },
  stepTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 5 },
  stepDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19 },

  // ---- CTA band ----
  ctaBand: {
    borderRadius: 24, padding: 34, alignItems: 'center',
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },
  ctaBandTitle: { color: Colors.white, fontFamily: FONT, fontSize: 32, letterSpacing: 1 },
  ctaBandSub: { color: 'rgba(255,255,255,0.80)', fontSize: 13, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  ctaBandBtn: {
    marginTop: 20, backgroundColor: Colors.cream, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 13,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  ctaBandBtnText: { color: '#8B0D20', fontFamily: FONT, fontSize: 18, letterSpacing: 1 },

  // ---- Footer ----
  footer: { paddingTop: 72, alignItems: 'center' },
  footerText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 16 },
  footerSmall: { color: Colors.textMuted, fontSize: 10, marginTop: 6, textAlign: 'center' },
});
