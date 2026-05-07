import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useHaptics } from '../../hooks/useHaptics';
import { Card as CardType, CardColor, CardType as CType, GamePhase } from '@uno/shared';
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

export default function GameScreen() {
  const { roomCode } = useLocalSearchParams<{ roomCode: string }>();
  const {
    gameState, myHand, isMyTurn, canCallUno,
    showColorPicker, showChallengeModal, showEndRoundModal, showFinalWinnerModal,
    drawnCard, canPlayDrawnCard,
    roundWinnerName, cumulativeScores,
    gameWinnerName, finalScores,
  } = useGameStore();
  const { playerId } = usePlayerStore();
  const {
    playCard, drawCard, playDrawnCard, callUno,
    challengeDrawFour, chooseColor, leaveRoom,
  } = useGameSocket();
  const haptics = useHaptics();

  const isHost = gameState?.players?.find(p => p.id === playerId)?.id === playerId;

  // Get other players (exclude self)
  const otherPlayers = useMemo(() => {
    if (!gameState) return [];
    return gameState.players.filter(p => p.id !== playerId);
  }, [gameState?.players, playerId]);

  const myPlayerIndex = useMemo(() => {
    if (!gameState) return -1;
    return gameState.players.findIndex(p => p.id === playerId);
  }, [gameState?.players, playerId]);

  const handlePlayCard = useCallback((card: CardType) => {
    if (!isMyTurn) return;

    // If it's a wild card, play it (server will ask for color)
    if (card.type === CType.WILD || card.type === CType.WILD_DRAW_FOUR) {
      haptics.mediumImpact();
      playCard(card.id);
      return;
    }

    haptics.mediumImpact();
    playCard(card.id);
  }, [isMyTurn, playCard, haptics]);

  const handleDrawCard = useCallback(() => {
    if (!isMyTurn) return;
    haptics.lightTap();
    drawCard();
  }, [isMyTurn, drawCard, haptics]);

  const handleCallUno = useCallback(() => {
    haptics.heavyImpact();
    callUno();
  }, [callUno, haptics]);

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
    drawCard();
  }, [drawCard, haptics]);

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const topCard = gameState.topCard;
  const currentColor = gameState.currentColor;

  return (
    <SafeAreaView style={styles.container}>
      {/* Direction Arrow */}
      <DirectionArrow direction={gameState.direction} />

      {/* Round info */}
      <View style={styles.roundInfo}>
        <Text style={styles.roundText}>Round {gameState.roundNumber}</Text>
      </View>

      {/* Other players at top */}
      <View style={styles.opponentsArea}>
        {otherPlayers.map((player, idx) => {
          const playerGlobalIndex = gameState.players.findIndex(p => p.id === player.id);
          const isActive = gameState.currentPlayerIndex === playerGlobalIndex;
          return (
            <PlayerSlot
              key={player.id}
              player={player}
              isActive={isActive}
              position={idx === 0 ? 'top' : idx === 1 ? 'topLeft' : 'topRight'}
            />
          );
        })}
      </View>

      {/* Center — discard + draw piles */}
      <View style={styles.centerArea}>
        <DrawPile
          count={gameState.drawPileCount}
          isMyTurn={isMyTurn && gameState.phase === GamePhase.PLAYING}
          onDraw={handleDrawCard}
        />
        <View style={{ width: 30 }} />
        <DiscardPile topCard={topCard} currentColor={currentColor} />
      </View>

      {/* Current color indicator */}
      <View style={styles.colorIndicator}>
        <View style={[styles.colorDot, { backgroundColor: getColorHex(currentColor) }]} />
        <Text style={styles.colorLabel}>{currentColor}</Text>
      </View>

      {/* Drawn card prompt */}
      {drawnCard && canPlayDrawnCard && (
        <View style={styles.drawnCardPrompt}>
          <Text style={styles.drawnCardText}>Play drawn card?</Text>
          <View style={styles.drawnCardButtons}>
            <View style={styles.drawnCardButtonWrap}>
              <Text onPress={() => playDrawnCard(false)} style={styles.drawnCardNo}>Keep</Text>
            </View>
            <View style={styles.drawnCardButtonWrap}>
              <Text onPress={() => playDrawnCard(true)} style={styles.drawnCardYes}>Play</Text>
            </View>
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

      {/* Player's hand at bottom */}
      <View style={styles.handArea}>
        <CardHand
          cards={myHand}
          topCard={topCard}
          currentColor={currentColor}
          isMyTurn={isMyTurn && gameState.phase === GamePhase.PLAYING}
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
  roundInfo: { position: 'absolute', top: 50, left: 15 },
  roundText: { color: Colors.textMuted, fontSize: 11, fontWeight: '700' },
  opponentsArea: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap',
    paddingTop: 50, paddingHorizontal: 10, gap: 8,
  },
  centerArea: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  colorIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  colorLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  turnBanner: {
    position: 'absolute', top: SH * 0.45, left: 0, right: 0, alignItems: 'center',
  },
  turnText: {
    color: Colors.neonPink, fontSize: 14, fontWeight: '900', letterSpacing: 2,
    textShadowColor: Colors.redGlow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  drawnCardPrompt: {
    position: 'absolute', bottom: 140, left: 20, right: 100,
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
  handArea: { paddingBottom: 20 },
});
