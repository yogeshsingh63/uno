import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useHaptics } from '../../hooks/useHaptics';
import { Card as CardType, CardColor, CardType as CType, GamePhase, TurnState } from '@uno/shared';
import { Colors } from '../../constants/colors';

import CardHand from '../../components/cards/CardHand';
import DiscardPile from '../../components/cards/DiscardPile';
import DrawPile from '../../components/cards/DrawPile';
import PlayerSlot from '../../components/game/PlayerSlot';
import UnoButton from '../../components/game/UnoButton';
import DirectionArrow from '../../components/game/DirectionArrow';
import ColorPickerModal from '../../components/modals/ColorPickerModal';
import ChallengeModal from '../../components/modals/ChallengeModal';
import EndRoundModal from '../../components/modals/EndRoundModal';
import FinalWinnerModal from '../../components/modals/FinalWinnerModal';

const { width: SW, height: SH } = Dimensions.get('window');
const EMOJIS = ['😂', '🔥', '😤', '🎉', '😱'];

export default function GameScreen() {
  const { roomCode } = useLocalSearchParams<{ roomCode: string }>();
  const {
    gameState, myHand, isMyTurn, canCallUno,
    showColorPicker, showChallengeModal, showEndRoundModal, showFinalWinnerModal,
    drawnCard, canPlayDrawnCard, toasts, emojiReactions,
    roundWinnerName, cumulativeScores,
    gameWinnerName, finalScores,
  } = useGameStore();
  const { playerId } = usePlayerStore();
  const {
    playCard, drawCard, playDrawnCard, passTurn, declareUno, callCatch,
    challengeDrawFour, acceptDrawFour, chooseColor, sendEmoji, leaveRoom, reconnectRoom,
  } = useGameSocket();
  const haptics = useHaptics();

  // Other players (exclude self)
  const otherPlayers = useMemo(() => {
    if (!gameState) return [];
    return gameState.players.filter(p => p.id !== playerId);
  }, [gameState?.players, playerId]);

  const handlePlayCard = useCallback((card: CardType) => {
    haptics.mediumImpact();
    playCard(card.id);
  }, [playCard, haptics]);

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

  const handleChallenge = useCallback(() => {
    haptics.heavyImpact();
    challengeDrawFour();
  }, [challengeDrawFour, haptics]);

  const handleAcceptDrawFour = useCallback(() => {
    haptics.lightTap();
    acceptDrawFour();
  }, [acceptDrawFour, haptics]);

  // Auto-reconnect on web page refresh
  React.useEffect(() => {
    if (!gameState && roomCode && playerId) {
      // Small timeout to ensure socket is connected before emitting
      const timer = setTimeout(() => {
        reconnectRoom(roomCode as string);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [gameState, roomCode, playerId, reconnectRoom]);

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const topCard = gameState.topCard;
  const currentColor = gameState.activeColor;
  const canInteract = isMyTurn && gameState.phase === GamePhase.PLAYING && 
    (gameState.turnState === TurnState.AWAITING_PLAY || gameState.turnState === TurnState.DREW_CARD);
  // Draw pile should be clickable when it's your turn and you can draw (including penalty draws)
  const canDraw = isMyTurn && gameState.phase === GamePhase.PLAYING && 
    (gameState.turnState === TurnState.AWAITING_PLAY || gameState.pendingDrawCount > 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Direction Arrow */}
      <DirectionArrow direction={gameState.direction} />

      {/* Round info + Score ticker */}
      <View style={styles.topBar}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundText}>Round {gameState.roundNumber}</Text>
        </View>
        <View style={styles.scoreTicker}>
          <Text style={styles.scoreTickerText}>
            Score: {gameState.scores[playerId || ''] || 0}
          </Text>
        </View>
      </View>

      {/* Toast notifications */}
      <View style={styles.toastArea} pointerEvents="none">
        {toasts.map((toast) => (
          <View key={toast.id} style={[styles.toast, styles[`toast_${toast.type}` as keyof typeof styles] || styles.toast_info]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ))}
      </View>

      {/* Other players at top */}
      <View style={styles.opponentsArea}>
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
              />
              {/* Catch UNO button */}
              {player.cardCount === 1 && !player.hasCalledUno && (
                <Pressable
                  style={styles.catchButton}
                  onPress={() => { haptics.heavyImpact(); callCatch(player.id); }}
                >
                  <Text style={styles.catchButtonText}>CATCH!</Text>
                </Pressable>
              )}
              {/* Emoji float */}
              {emoji && (
                <Text style={styles.emojiFloat}>{emoji.emoji}</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Center — discard + draw piles */}
      <View style={styles.centerArea}>
        <DrawPile
          count={gameState.drawPileCount}
          isMyTurn={canDraw}
          onDraw={handleDrawCard}
        />
        <View style={{ width: 30 }} />
        <DiscardPile topCard={topCard} currentColor={currentColor} />
      </View>

      {/* Current color indicator */}
      <View style={styles.colorIndicator}>
        <View style={[styles.colorDot, { backgroundColor: getColorHex(currentColor) }]} />
        <Text style={styles.colorLabel}>{currentColor}</Text>
        {gameState.pendingDrawCount > 0 && (
          <Text style={styles.pendingDraw}>+{gameState.pendingDrawCount}</Text>
        )}
      </View>

      {/* Drawn card prompt */}
      {drawnCard && canPlayDrawnCard && (
        <View style={styles.drawnCardPrompt}>
          <Text style={styles.drawnCardText}>Play drawn card?</Text>
          <View style={styles.drawnCardButtons}>
            <Pressable style={styles.drawnCardButtonWrap} onPress={() => playDrawnCard(false)}>
              <Text style={styles.drawnCardNo}>Keep</Text>
            </Pressable>
            <Pressable style={styles.drawnCardButtonWrap} onPress={() => playDrawnCard(true)}>
              <Text style={styles.drawnCardYes}>Play</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Turn indicator */}
      {isMyTurn && (
        <View style={styles.turnBanner} pointerEvents="none">
          <Text style={styles.turnText}>Your Turn!</Text>
        </View>
      )}

      {/* UNO Button */}
      <UnoButton
        visible={canCallUno || myHand.length === 1}
        shouldPulse={myHand.length <= 2}
        onPress={handleCallUno}
      />

      {/* Emoji reaction buttons */}
      <View style={styles.emojiBar}>
        {EMOJIS.map((emoji) => (
          <Pressable key={emoji} style={styles.emojiButton} onPress={() => sendEmoji(emoji)}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </Pressable>
        ))}
      </View>

      {/* Player's hand at bottom */}
      <View style={styles.handArea}>
        <Text style={styles.handLabel}>YOUR HAND · {myHand.length} cards</Text>
        <CardHand
          cards={myHand}
          topCard={topCard}
          currentColor={currentColor}
          isMyTurn={canInteract}
          onPlayCard={handlePlayCard}
        />
      </View>

      {/* Modals */}
      <ColorPickerModal visible={showColorPicker} onSelectColor={handleChooseColor} />
      <ChallengeModal
        visible={showChallengeModal}
        onAccept={handleAcceptDrawFour}
        onChallenge={handleChallenge}
      />
      <EndRoundModal
        visible={showEndRoundModal}
        winnerName={roundWinnerName}
        players={gameState.players}
        scores={cumulativeScores}
        isHost={gameState.players[0]?.id === playerId}
        onNextRound={() => useGameStore.getState().setShowEndRoundModal(false)}
        onLeave={leaveRoom}
      />
      <FinalWinnerModal
        visible={showFinalWinnerModal}
        winnerName={gameWinnerName}
        players={gameState.players}
        scores={finalScores}
        onPlayAgain={() => useGameStore.getState().setShowFinalWinnerModal(false)}
        onLeave={leaveRoom}
      />
    </SafeAreaView>
  );
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
  loadingText: { color: Colors.textPrimary, fontSize: 16, textAlign: 'center', marginTop: 100 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 15, paddingTop: 50,
  },
  roundInfo: {},
  roundText: { color: Colors.textMuted, fontSize: 11, fontWeight: '700' },
  scoreTicker: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  scoreTickerText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },

  toastArea: {
    position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center', zIndex: 100,
  },
  toast: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 4,
  },
  toast_info: { backgroundColor: 'rgba(30,30,50,0.9)' },
  toast_success: { backgroundColor: 'rgba(48,209,88,0.9)' },
  toast_warning: { backgroundColor: 'rgba(255,214,0,0.9)' },
  toast_error: { backgroundColor: 'rgba(229,57,53,0.9)' },
  toast_uno: { backgroundColor: 'rgba(255,214,0,0.95)' },
  toastText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  opponentsArea: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
    paddingTop: 10, paddingHorizontal: 10, gap: 8,
  },
  playerSlotWrap: { alignItems: 'center', position: 'relative' },
  catchButton: {
    backgroundColor: Colors.red, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2,
  },
  catchButtonText: { color: Colors.white, fontSize: 9, fontWeight: '900' },
  emojiFloat: {
    position: 'absolute', top: -20, fontSize: 24,
  },

  centerArea: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  colorIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  colorLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  pendingDraw: {
    color: Colors.red, fontSize: 13, fontWeight: '900', marginLeft: 8,
  },

  turnBanner: {
    position: 'absolute', top: SH * 0.45, left: 0, right: 0, alignItems: 'center',
  },
  turnText: {
    color: Colors.neonPink, fontSize: 14, fontWeight: '900', letterSpacing: 2,
  },

  drawnCardPrompt: {
    position: 'absolute', bottom: 160, left: 20, right: 100,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  drawnCardText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  drawnCardButtons: { flexDirection: 'row', gap: 8 },
  drawnCardButtonWrap: { flex: 1 },
  drawnCardNo: {
    color: Colors.textSecondary, textAlign: 'center', paddingVertical: 8,
    backgroundColor: Colors.surfaceLight, borderRadius: 8, overflow: 'hidden', fontWeight: '700', fontSize: 13,
  },
  drawnCardYes: {
    color: Colors.white, textAlign: 'center', paddingVertical: 8,
    backgroundColor: Colors.green, borderRadius: 8, overflow: 'hidden', fontWeight: '700', fontSize: 13,
  },

  emojiBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 4,
  },
  emojiButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center',
  },
  emojiText: { fontSize: 18 },

  handArea: { paddingBottom: 20 },
  handLabel: {
    color: Colors.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'center',
    marginBottom: 4, opacity: 0.5, letterSpacing: 1,
  },
});
