import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn, FadeInDown, FadeOut, ZoomIn, useAnimatedStyle, useSharedValue,
  withSequence, withTiming, withSpring, withDelay,
} from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { soundService } from '../../services/soundService';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useHaptics } from '../../hooks/useHaptics';
import { useResponsive } from '../../hooks/useResponsive';
import { Card as CardType, CardColor, GamePhase, TurnState } from '@uno/shared';
import { Colors } from '../../constants/colors';
import PressableScale from '../../components/ui/PressableScale';
import AdBannerSlot from '../../components/ads/AdBannerSlot';
import { maybeShowInterstitial } from '../../components/ads/adHooks';

import ElementalBackground from '../../components/ui/ElementalBackground';
import CardHand from '../../components/cards/CardHand';
import DiscardPile from '../../components/cards/DiscardPile';
import DrawPile from '../../components/cards/DrawPile';
import PlayerSlot from '../../components/game/PlayerSlot';
import UnoButton from '../../components/game/UnoButton';
import DirectionArrow from '../../components/game/DirectionArrow';
import FlyingCard from '../../components/game/FlyingCard';
import ColorPickerModal from '../../components/modals/ColorPickerModal';
import ChallengeModal from '../../components/modals/ChallengeModal';
import SwapTargetModal from '../../components/modals/SwapTargetModal';
import EndRoundModal from '../../components/modals/EndRoundModal';
import FinalWinnerModal from '../../components/modals/FinalWinnerModal';
import GameMenuModal from '../../components/modals/GameMenuModal';

const EMOJIS = ['😂', '🔥', '😤', '🎉', '😱'];

/** Seats around the table for the opponents (me = bottom seat). */
type SeatName = 'top' | 'topLeft' | 'topRight' | 'left' | 'right';

function seatsFor(count: number): SeatName[] | null {
  if (count === 1) return ['top'];
  if (count === 2) return ['topLeft', 'topRight'];
  if (count === 3) return ['left', 'top', 'right'];
  if (count === 4) return ['left', 'topLeft', 'topRight', 'right'];
  if (count === 5) return ['left', 'topLeft', 'top', 'topRight', 'right'];
  return null; // 6+ opponents → scrollable row across the top
}

const SEAT_STYLES: Record<SeatName, any> = {
  top: { top: 0, alignSelf: 'center' },
  topLeft: { left: 6, top: 0 },
  topRight: { right: 6, top: 0 },
  left: { left: 4, top: '40%' },
  right: { right: 4, top: '40%' },
};

interface FlyState {
  card: CardType;
  seq: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export default function GameScreen() {
  const { roomCode } = useLocalSearchParams<{ roomCode: string }>();
  const {
    gameState, roomState, myHand, isMyTurn, canCallUno,
    showColorPicker, showChallengeModal, showSwapModal, showEndRoundModal, showFinalWinnerModal,
    drawnCard, canPlayDrawnCard, toasts, emojiReactions, lastDrawSeq, lastDrawCard,
    roundWinnerName, cumulativeScores,
    gameWinnerName, finalScores, effects,
  } = useGameStore();
  const { playerId } = usePlayerStore();
  const { hapticsEnabled, soundEnabled, toggleHaptics, toggleSound } = useSettingsStore();
  const {
    playCard, drawCard, playDrawnCard, passTurn, declareUno, callCatch,
    challengeDrawFour, acceptDrawFour, chooseColor, sendEmoji, leaveRoom, reconnectRoom,
    nextRound, playAgain, swapHands, jumpIn,
  } = useGameSocket();
  const haptics = useHaptics();
  const { cardW, cardH, pileW, pileH } = useResponsive();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [fly, setFly] = useState<FlyState | null>(null);
  const [flyPlay, setFlyPlay] = useState<FlyState | null>(null);

  const drawRef = useRef<View>(null);
  const discardRef = useRef<View>(null);
  const handRef = useRef<View>(null);

  // Camera shake + red flash on +2/+4 hits
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const hitFlash = useSharedValue(0);
  const hitSeenRef = useRef('');
  const flyPlayScatterRef = useRef(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { translateY: shakeY.value },
    ],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: hitFlash.value,
  }));

  // Trigger camera shake when anyone gets hit by +2/+4
  React.useEffect(() => {
    const hit = effects.find(e => e.kind === 'hit');
    if (hit && hitSeenRef.current !== hit.id) {
      hitSeenRef.current = hit.id;
      hitFlash.value = withSequence(
        withTiming(0.5, { duration: 70 }),
        withDelay(380, withTiming(0, { duration: 320 })),
      );
      shakeX.value = withSequence(
        withTiming(-8, { duration: 45 }),
        withTiming(8, { duration: 45 }),
        withTiming(-6, { duration: 45 }),
        withTiming(6, { duration: 45 }),
        withTiming(-3, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
      shakeY.value = withSequence(
        withTiming(3, { duration: 60 }),
        withTiming(-3, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [effects]);

  // Other players (exclude self)
  const otherPlayers = useMemo(() => {
    if (!gameState) return [];
    return gameState.players.filter(p => p.id !== playerId);
  }, [gameState?.players, playerId]);

  // Swap candidates from the server (only shown to the active swapper)
  const swapCandidates = useMemo(() => {
    if (!gameState?.swapOptions) return [];
    return otherPlayers.filter(p => gameState.swapOptions!.includes(p.id));
  }, [gameState?.swapOptions, otherPlayers]);

  // Exact-match card I can Jump-In with (house rule)
  const jumpInCard = useMemo(() => {
    const j = gameState?.jumpIn;
    if (!j || Date.now() > j.expiresAt) return null;
    const [color, type, value] = j.signature.split(':');
    return myHand.find(c =>
      c.color === color && c.type === type && String(c.value ?? '') === (value ?? '')
    ) || null;
  }, [gameState?.jumpIn, myHand]);

  // ---- Flying card: deck → hand on every draw ----
  React.useEffect(() => {
    if (!lastDrawCard || lastDrawSeq === 0) return;
    let cancelled = false;
    const measure = () => {
      drawRef.current?.measureInWindow((dx, dy, dw, dh) => {
        handRef.current?.measureInWindow((hx, hy, hw, hh) => {
          if (cancelled) return;
          const measured = dw > 0 && hw > 0;
          setFly({
            card: lastDrawCard!,
            seq: lastDrawSeq,
            from: measured ? { x: dx + dw / 2, y: dy + dh / 2 } : { x: 140, y: 300 },
            to: measured ? { x: hx + hw / 2, y: hy + hh / 2 } : { x: 180, y: 640 },
          });
        });
      });
    };
    measure();
    return () => { cancelled = true; };
  }, [lastDrawSeq, lastDrawCard]);

  const handlePlayCard = useCallback((card: CardType) => {
    haptics.mediumImpact();
    soundService.play('play');
    // Arc the card from the hand to the discard pile
    const idx = myHand.findIndex(c => c.id === card.id);
    const n = myHand.length;
    const measure = () => {
      handRef.current?.measureInWindow((hx, hy, hw, hh) => {
        discardRef.current?.measureInWindow((dx, dy, dw, dh) => {
          const measured = hw > 0 && dw > 0;
          // Deterministic scatter angle from the card id (stable across re-renders)
          let hash = 0;
          for (let i = 0; i < card.id.length; i++) hash = (hash * 31 + card.id.charCodeAt(i)) | 0;
          const scatter = (hash % 9) - 4; // -4..4 deg
          setFlyPlay({
            card,
            seq: Date.now(),
            from: measured
              ? { x: hx + hw * ((idx + 0.5) / Math.max(1, n)), y: hy + hh * 0.55 }
              : { x: 200, y: 560 },
            to: measured ? { x: dx + dw / 2, y: dy + dh / 2 } : { x: 300, y: 320 },
          });
          flyPlayScatterRef.current = scatter;
        });
      });
    };
    measure();
    playCard(card.id);
  }, [playCard, haptics, myHand]);

  const handleDrawCard = useCallback(() => {
    haptics.lightTap();
    drawCard();
  }, [drawCard, haptics]);

  const handleCallUno = useCallback(() => {
    haptics.heavyImpact();
    declareUno();
  }, [declareUno, haptics]);

  const handleChooseColor = useCallback((color: CardColor) => {
    haptics.mediumImpact();
    chooseColor(color);
  }, [chooseColor, haptics]);

  // Win fanfare when the round/game end modals appear
  const winPlayedRef = React.useRef(0);
  React.useEffect(() => {
    if (showEndRoundModal || showFinalWinnerModal) {
      if (winPlayedRef.current !== (showEndRoundModal ? 1 : 2)) {
        winPlayedRef.current = showEndRoundModal ? 1 : 2;
        soundService.play('win');
      }
    }
  }, [showEndRoundModal, showFinalWinnerModal]);

  // Interstitial trigger point: after the round-end screen closes,
  // before the next round starts (natural break, least disruptive).
  const prevEndModalRef = React.useRef(showEndRoundModal);
  React.useEffect(() => {
    if (prevEndModalRef.current && !showEndRoundModal && !showFinalWinnerModal) {
      // Stub — real ad SDK hooks in here (see components/ads/adHooks.ts)
      maybeShowInterstitial();
    }
    prevEndModalRef.current = showEndRoundModal;
  }, [showEndRoundModal, showFinalWinnerModal]);

  const handleChallenge = useCallback(() => {
    haptics.heavyImpact();
    challengeDrawFour();
  }, [challengeDrawFour, haptics]);

  const handleAcceptDrawFour = useCallback(() => {
    haptics.lightTap();
    acceptDrawFour();
  }, [acceptDrawFour, haptics]);

  const handlePass = useCallback(() => {
    haptics.lightTap();
    passTurn();
  }, [passTurn, haptics]);

  // Auto-reconnect on web page refresh
  React.useEffect(() => {
    if (!gameState && roomCode && playerId) {
      const timer = setTimeout(() => {
        reconnectRoom(roomCode as string);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [gameState, roomCode, playerId, reconnectRoom]);

  if (!gameState) {
    return (
      <View style={styles.container}>
        <ElementalBackground variant="cosmic" lite />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const topCard = gameState.topCard;
  const currentColor = gameState.activeColor;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const canInteract = isMyTurn && gameState.phase === GamePhase.PLAYING &&
    gameState.pendingDrawCount === 0 &&
    (gameState.turnState === TurnState.AWAITING_PLAY || gameState.turnState === TurnState.DREW_CARD);
  // Draw pile should be clickable when it's your turn and you can draw (including penalty draws)
  const canDraw = isMyTurn && gameState.phase === GamePhase.PLAYING &&
    (gameState.turnState === TurnState.AWAITING_PLAY || gameState.pendingDrawCount > 0);
  const inDrewCard = isMyTurn && gameState.turnState === TurnState.DREW_CARD;
  const manyOpponents = otherPlayers.length > 4;
  const seats = seatsFor(otherPlayers.length);

  // Transient table effects
  const splashEffect = effects.find(e => e.kind === 'splash') || null;

  return (
    <SafeAreaView style={styles.container}>
      <ElementalBackground variant="cosmic" lite />

      <Animated.View style={[styles.gameContent, shakeStyle]}>

      {/* Jump-In banner (house rule) */}
      {jumpInCard && (
        <PressableScale
          style={styles.jumpInButton}
          onPress={() => { haptics.heavyImpact(); jumpIn(jumpInCard.id); }}
        >
          <Text style={styles.jumpInText}>⚡ JUMP IN!</Text>
        </PressableScale>
      )}

      {/* Top bar: exit · round/room · menu */}
      <View style={styles.topBar}>
        <PressableScale style={styles.iconBtn} onPress={leaveRoom}>
          <Text style={styles.iconText}>✕</Text>
        </PressableScale>
        <View style={styles.topCenter}>
          <Text style={styles.roundText}>ROUND {gameState.roundNumber}</Text>
          <Text style={styles.roomText}>{roomCode}</Text>
        </View>
        <PressableScale style={styles.iconBtn} onPress={() => setShowMenu(true)}>
          <Text style={styles.iconText}>☰</Text>
        </PressableScale>
      </View>

      {/* Active color + pending draws */}
      <View style={styles.statusRow}>
        <View style={styles.colorChip}>
          <View style={[styles.colorDot, { backgroundColor: getColorHex(currentColor) }]} />
          <Text style={styles.colorLabel}>{currentColor}</Text>
          {gameState.pendingDrawCount > 0 && (
            <Text style={styles.pendingDraw}>+{gameState.pendingDrawCount}</Text>
          )}
        </View>
      </View>

      {/* Toast notifications */}
      <View style={styles.toastArea} pointerEvents="none">
        {toasts.map((toast) => (
          <View key={toast.id} style={[styles.toast, TOAST_STYLES[toast.type]]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ))}
      </View>

      {/* ============ THE TABLE ============ */}
      <View style={styles.tableWrap}>
        {/* Opponents seated around the table (or a scroll row for 6+) */}
        {seats ? (
          otherPlayers.map((player, idx) => {
            const seat = seats[idx];
            const playerGlobalIndex = gameState.players.findIndex(p => p.id === player.id);
            const isActive = gameState.currentPlayerIndex === playerGlobalIndex;
            const emoji = emojiReactions.find(e => e.playerId === player.id);
            return (
              <View key={player.id} style={[styles.seat, SEAT_STYLES[seat]]}>
                <PlayerSlot
                  player={player}
                  isActive={isActive}
                  position={seat === 'left' ? 'left' : seat === 'right' ? 'right' : 'top'}
                  totalPlayers={gameState.players.length}
                  effect={slotEffectFor(player.id, effects)}
                />
                {/* Catch UNO button */}
                {player.cardCount === 1 && !player.hasCalledUno && (
                  <PressableScale
                    style={styles.catchButton}
                    onPress={() => { haptics.heavyImpact(); callCatch(player.id); }}
                  >
                    <Text style={styles.catchButtonText}>CATCH!</Text>
                  </PressableScale>
                )}
                {/* Emoji float */}
                {emoji && (
                  <Text style={styles.emojiFloat}>{emoji.emoji}</Text>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.opponentsWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.opponentsContent}
            >
              {otherPlayers.map((player, idx) => {
                const playerGlobalIndex = gameState.players.findIndex(p => p.id === player.id);
                const isActive = gameState.currentPlayerIndex === playerGlobalIndex;
                const emoji = emojiReactions.find(e => e.playerId === player.id);
                return (
                  <View key={player.id} style={styles.playerSlotWrap}>
                    <PlayerSlot
                      player={player}
                      isActive={isActive}
                      position={idx === 0 ? 'top' : idx === 1 ? 'topLeft' : 'topRight'}
                      totalPlayers={gameState.players.length}
                      effect={slotEffectFor(player.id, effects)}
                    />
                    {player.cardCount === 1 && !player.hasCalledUno && (
                      <PressableScale
                        style={styles.catchButton}
                        onPress={() => { haptics.heavyImpact(); callCatch(player.id); }}
                      >
                        <Text style={styles.catchButtonText}>CATCH!</Text>
                      </PressableScale>
                    )}
                    {emoji && (
                      <Text style={styles.emojiFloat}>{emoji.emoji}</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Felt surface */}
        <View style={styles.tableRim}>
          <LinearGradient
            colors={['#1E7A4A', '#125C38', '#0A3D24']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.felt}
          >
            {/* Felt inner shading */}
            <LinearGradient
              colors={['rgba(255,255,255,0.10)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.30)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Center piles */}
            <View style={styles.centerArea}>
              <View ref={drawRef} collapsable={false}>
                <DrawPile
                  count={gameState.drawPileCount}
                  isMyTurn={canDraw}
                  onDraw={handleDrawCard}
                  cardWidth={pileW}
                  cardHeight={pileH}
                />
              </View>
              <View style={styles.directionWrap}>
                <DirectionArrow direction={gameState.direction} style={styles.directionInline} />
              </View>
              <View ref={discardRef} collapsable={false}>
                {/* Wild color splash burst */}
                {splashEffect && (
                  <Animated.View
                    key={splashEffect.id}
                    entering={ZoomIn.duration(380).springify().damping(14)}
                    exiting={FadeOut.duration(280)}
                    pointerEvents="none"
                    style={[styles.splash, { backgroundColor: getColorHex(splashEffect.color || currentColor) }]}
                  />
                )}
                  <DiscardPile
                    topCard={topCard}
                    currentColor={currentColor}
                    cardWidth={pileW}
                    cardHeight={pileH}
                  />
                </View>
            </View>

            {/* Turn indicator */}
            <Animated.View
              key={gameState.currentPlayerIndex}
              entering={FadeInDown.duration(260)}
              style={styles.turnPill}
              pointerEvents="none"
            >
              <Text style={[styles.turnText, isMyTurn && styles.turnTextMine]}>
                {isMyTurn ? 'YOUR TURN' : `${currentPlayer?.name}'s turn`}
              </Text>
            </Animated.View>
          </LinearGradient>
        </View>
      </View>

      {/* Drawn card prompt / pass */}
      {inDrewCard && (
        <View style={[styles.drawnCardPrompt, { bottom: cardH + 76 }]}>
          <Text style={styles.drawnCardText}>
            {drawnCard && canPlayDrawnCard ? 'Play the drawn card?' : 'Card drawn — play it or pass'}
          </Text>
          <View style={styles.drawnCardButtons}>
            <PressableScale style={styles.drawnCardButtonWrap} onPress={handlePass}>
              <Text style={styles.drawnCardNo}>Pass</Text>
            </PressableScale>
            {drawnCard && canPlayDrawnCard && (
              <PressableScale style={styles.drawnCardButtonWrap} onPress={() => playDrawnCard(true)}>
                <Text style={styles.drawnCardYes}>Play</Text>
              </PressableScale>
            )}
          </View>
        </View>
      )}

      {/* UNO Button */}
      <UnoButton
        visible={canCallUno || myHand.length === 1}
        shouldPulse={myHand.length <= 2}
        onPress={handleCallUno}
        bottomOffset={cardH + 46}
      />

      {/* Emoji reactions (collapsible) */}
      <View style={[styles.emojiArea, { bottom: cardH + 22 }]}>
        {emojiOpen && (
          <Animated.View entering={FadeIn.duration(180)} style={styles.emojiBar}>
            {EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={styles.emojiButton}
                onPress={() => { sendEmoji(emoji); setEmojiOpen(false); }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}
        <PressableScale
          style={[styles.emojiToggle, emojiOpen && styles.emojiToggleActive]}
          onPress={() => setEmojiOpen(!emojiOpen)}
        >
          <Text style={styles.emojiToggleText}>😊</Text>
        </PressableScale>
      </View>

      {/* Reserved banner ad slot (bottom, collapsible, labeled) */}
      <AdBannerSlot />

      {/* Player's hand at bottom */}
      <View ref={handRef} collapsable={false} style={styles.handArea}>
        <Text style={styles.handLabel}>YOUR HAND · {myHand.length} cards</Text>
        <CardHand
          cards={myHand}
          topCard={topCard}
          currentColor={currentColor}
          isMyTurn={canInteract}
          onPlayCard={handlePlayCard}
        />
      </View>

      </Animated.View>{/* end shake wrapper */}

      {/* Red hit flash vignette */}
      <Animated.View pointerEvents="none" style={[styles.hitFlash, flashStyle]}>
        <LinearGradient
          colors={['rgba(229,57,53,0)','rgba(229,57,53,0.28)','rgba(229,57,53,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.hitFlashVignette} />
      </Animated.View>

      {/* Flying draw card (deck → hand, 3D flip) */}
      {fly && (
        <FlyingCard
          key={fly.seq}
          card={fly.card}
          seq={fly.seq}
          cardWidth={pileW}
          cardHeight={pileH}
          from={fly.from}
          to={fly.to}
          flip
          onDone={() => setFly(null)}
        />
      )}

      {/* Flying play card (hand → discard, arc + scatter) */}
      {flyPlay && (
        <FlyingCard
          key={flyPlay.seq}
          card={flyPlay.card}
          seq={flyPlay.seq}
          cardWidth={cardW}
          cardHeight={cardH}
          from={flyPlay.from}
          to={flyPlay.to}
          landRotate={flyPlayScatterRef.current}
          duration={400}
          onDone={() => setFlyPlay(null)}
        />
      )}

      {/* Modals */}
      <ColorPickerModal visible={showColorPicker} onSelectColor={handleChooseColor} />
      <ChallengeModal
        visible={showChallengeModal}
        onAccept={handleAcceptDrawFour}
        onChallenge={handleChallenge}
      />
      <SwapTargetModal
        visible={showSwapModal}
        players={swapCandidates}
        onSelect={swapHands}
        onCancel={() => {
          const r = swapCandidates[Math.floor(Math.random() * swapCandidates.length)];
          if (r) swapHands(r.id);
        }}
      />
      <EndRoundModal
        visible={showEndRoundModal}
        winnerName={roundWinnerName}
        players={gameState.players}
        scores={cumulativeScores}
        isHost={roomState?.hostId === playerId}
        onNextRound={nextRound}
        onLeave={leaveRoom}
      />
      <FinalWinnerModal
        visible={showFinalWinnerModal}
        winnerName={gameWinnerName}
        players={gameState.players}
        scores={finalScores}
        onPlayAgain={playAgain}
        onLeave={leaveRoom}
      />
      <GameMenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        roomCode={String(roomCode ?? '')}
        roundNumber={gameState.roundNumber}
        players={gameState.players}
        scores={gameState.scores}
        settings={gameState.settings}
        myPlayerId={playerId}
        hapticsEnabled={hapticsEnabled}
        soundEnabled={soundEnabled}
        onToggleHaptics={toggleHaptics}
        onToggleSound={toggleSound}
        onLeave={leaveRoom}
      />
    </SafeAreaView>
  );
}

/** Narrow a table effect down to the player-slot kinds (skip/hit/caught). */
function slotEffectFor(playerId: string, effects: { kind: string; playerId?: string }[]):
  { kind: 'skip' | 'hit' | 'caught' } | null {
  const e = effects.find(x => x.playerId === playerId);
  if (!e || e.kind === 'splash') return null;
  return { kind: e.kind as 'skip' | 'hit' | 'caught' };
}

function getColorHex(color: CardColor): string {
  switch (color) {
    case CardColor.RED: return Colors.red;
    case CardColor.YELLOW: return Colors.yellow;
    case CardColor.GREEN: return Colors.green;
    case CardColor.BLUE: return Colors.blue;
    default: return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingText: { color: Colors.textPrimary, fontSize: 16, textAlign: 'center', marginTop: 120 },
  gameContent: { flex: 1 },
  hitFlash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  hitFlashVignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 40,
    borderColor: 'rgba(232,54,75,0.45)',
  },
  splash: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -60,
    left: -60,
    zIndex: 0,
    opacity: 0.3,
  },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 50,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,220,180,0.06)', borderWidth: 1, borderColor: 'rgba(255,220,180,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  topCenter: { alignItems: 'center' },
  roundText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  roomText: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2, letterSpacing: 1 },

  statusRow: { alignItems: 'center', marginTop: 8 },
  colorChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,220,180,0.06)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  colorLabel: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  pendingDraw: { color: Colors.red, fontSize: 12, fontWeight: '800', marginLeft: 8 },

  toastArea: {
    position: 'absolute', top: 100, left: 0, right: 0, alignItems: 'center', zIndex: 100,
  },
  toast: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginBottom: 4 },
  toast_info: { backgroundColor: 'rgba(28,22,30,0.92)' },
  toast_success: { backgroundColor: 'rgba(46,189,94,0.92)' },
  toast_warning: { backgroundColor: 'rgba(245,184,0,0.92)' },
  toast_error: { backgroundColor: 'rgba(232,54,75,0.92)' },
  toast_uno: { backgroundColor: 'rgba(245,184,0,0.95)' },
  toastText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  // ---- Table ----
  tableWrap: {
    flex: 1, justifyContent: 'center', paddingHorizontal: 14, position: 'relative',
  },
  seat: {
    position: 'absolute', zIndex: 20, alignItems: 'center',
  },
  opponentsWrap: {
    position: 'absolute', top: -4, left: 0, right: 0, zIndex: 20,
  },
  opponentsContent: { paddingHorizontal: 12, gap: 6 },
  opponentsCentered: { justifyContent: 'center' },
  playerSlotWrap: { alignItems: 'center', position: 'relative' },
  catchButton: {
    backgroundColor: Colors.red, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2,
  },
  catchButtonText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  emojiFloat: { position: 'absolute', top: -20, fontSize: 24 },

  tableRim: {
    marginTop: 30,
    borderRadius: 36,
    padding: 10,
    backgroundColor: '#261812',
    borderWidth: 1.5,
    borderColor: '#3D2A1F',
    shadowColor: '#000000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 22, elevation: 16,
  },
  felt: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  centerArea: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  directionWrap: { width: 52, alignItems: 'center' },
  directionInline: { position: 'relative', top: 0, right: 0 },
  turnPill: {
    position: 'absolute', bottom: 12, alignSelf: 'center',
    backgroundColor: 'rgba(28, 22, 30, 0.80)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,220,180,0.12)',
  },
  turnText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  turnTextMine: { color: Colors.yellow, textShadowColor: 'rgba(245,184,0,0.35)', textShadowRadius: 6 },

  jumpInButton: {
    position: 'absolute', top: 150, alignSelf: 'center', zIndex: 60,
    backgroundColor: Colors.red, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7,
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12,
    elevation: 10, borderWidth: 2, borderColor: Colors.cream,
  },
  jumpInText: { color: Colors.white, fontSize: 13, fontWeight: '800', letterSpacing: 1 },

  drawnCardPrompt: {
    position: 'absolute', left: 18, right: 18, alignSelf: 'center',
    backgroundColor: 'rgba(28,22,30,0.92)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,220,180,0.10)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
  },
  drawnCardText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  drawnCardButtons: { flexDirection: 'row', gap: 10 },
  drawnCardButtonWrap: { flex: 1 },
  drawnCardNo: {
    color: Colors.textSecondary, textAlign: 'center', paddingVertical: 10,
    backgroundColor: Colors.surfaceLight, borderRadius: 10, overflow: 'hidden', fontWeight: '700', fontSize: 13,
  },
  drawnCardYes: {
    color: Colors.white, textAlign: 'center', paddingVertical: 10,
    backgroundColor: Colors.green, borderRadius: 10, overflow: 'hidden', fontWeight: '700', fontSize: 13,
  },

  emojiArea: {
    position: 'absolute', left: 12, zIndex: 40, alignItems: 'flex-start',
  },
  emojiBar: {
    flexDirection: 'row', gap: 5, marginBottom: 6,
    backgroundColor: 'rgba(28,22,30,0.92)', borderRadius: 16,
    paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,220,180,0.10)',
  },
  emojiButton: {
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  emojiText: { fontSize: 16 },
  emojiToggle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,220,180,0.06)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,220,180,0.10)',
  },
  emojiToggleActive: { backgroundColor: 'rgba(212,168,67,0.15)', borderColor: Colors.metallicGold },
  emojiToggleText: { fontSize: 15 },

  handArea: { paddingBottom: 8, paddingTop: 4 },
  handLabel: {
    color: Colors.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center',
    marginBottom: 4, opacity: 0.5, letterSpacing: 1,
  },
});

const TOAST_STYLES: Record<string, any> = {
  info: styles.toast_info,
  success: styles.toast_success,
  warning: styles.toast_warning,
  error: styles.toast_error,
  uno: styles.toast_uno,
};
