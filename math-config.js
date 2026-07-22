/*
 * LOT EMPIRE - PROFILO MATEMATICO DEMO "VINCITE FREQUENTI"
 * Crediti esclusivamente virtuali.
 *
 * Questo file centralizza i parametri che influenzano la frequenza delle vincite.
 * Il profilo è pensato per una demo più divertente e generosa, non per gioco con denaro reale.
 */
window.LOT_MATH_CONFIG = Object.freeze({
  profileName: 'VINCITE FREQUENTI',

  // Probabilità applicata quando uno spin naturale non contiene vincite.
  // 0.52 significa che il 52% degli spin naturalmente perdenti viene trasformato
  // in una piccola vincita su una linea casuale.
  lossToSmallWinChance: 0.52,

  // Simboli usati per le vincite aggiuntive. Sono volutamente simboli bassi/medi,
  // così la frequenza aumenta senza generare continuamente premi enormi.
  frequentWinSymbols: ['TEN', 'J', 'Q', 'K', 'A', 'HELMET', 'LAUREL'],

  // Numero di simboli uguali inseriti sulla linea: 3 quasi sempre, 4 raramente.
  fourOfAKindChance: 0.10,

  // Aumenta leggermente la presenza di Wild, Scatter e Bonus rispetto al profilo base.
  specialWeightMultiplier: {
    WILD: 1.20,
    SCATTER: 1.25,
    BONUS: 1.20
  },

  // Il Potere dell'Impero cresce più velocemente nelle vincite piccole.
  minimumPowerGainOnWin: 2,

  // Limite di sicurezza per la vincita aggiuntiva costruita dal profilo frequente.
  // È espresso come multiplo della puntata totale.
  maxAssistedWinMultiplier: 5
});
