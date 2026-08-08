(function exposeLandlordScoring(root) {
  function resolveTieWinner({ tieOutcome = 'draw', handicaps = [], landlordIndex }) {
    if (tieOutcome === 'landlord') return 'landlord';
    if (tieOutcome === 'peasants') return 'peasants';
    if (tieOutcome !== 'higher-handicap-landlord') return 'none';
    const values = handicaps.map(value => Number(value) || 0);
    if (landlordIndex < 0 || landlordIndex >= values.length) return 'none';
    return values[landlordIndex] > Math.min(...values) ? 'landlord' : 'none';
  }

  function compareLandlordWithBestPeasants({
    scoringValues,
    landlordIndex,
    bestPeasantCount,
    multiplier = 1,
    tieWinner = 'none'
  }) {
    const values = (scoringValues || []).map(value => Number(value));
    if (!values.length || values.some(value => !Number.isFinite(value))) return null;
    if (landlordIndex < 0 || landlordIndex >= values.length) return null;

    const peasantIndexes = values
      .map((_, index) => index)
      .filter(index => index !== landlordIndex);
    const selectedCount = Math.max(
      1,
      Math.min(peasantIndexes.length, Math.round(Number(bestPeasantCount) || peasantIndexes.length))
    );
    const selectedPeasantIndexes = peasantIndexes
      .slice()
      .sort((a, b) => values[a] - values[b] || a - b)
      .slice(0, selectedCount);
    const landlordTotal = values[landlordIndex] * selectedCount;
    const peasantsTotal = selectedPeasantIndexes.reduce((sum, index) => sum + values[index], 0);
    const diff = peasantsTotal - landlordTotal;
    const landlordWon = diff > 0 || (diff === 0 && tieWinner === 'landlord');
    const tied = diff === 0 && tieWinner === 'none';
    const stake = Math.max(1, Math.round(Number(multiplier) || 1));
    const points = values.map(() => 0);

    if (!tied) {
      points[landlordIndex] = (landlordWon ? 1 : -1) * stake * peasantIndexes.length;
      peasantIndexes.forEach(index => { points[index] = (landlordWon ? -1 : 1) * stake; });
    }

    return {
      peasantIndexes,
      selectedPeasantIndexes,
      selectedCount,
      landlordTotal,
      peasantsTotal,
      diff,
      landlordWon,
      tied,
      stake,
      points
    };
  }

  root.SIMPLE_GOLF_LANDLORD_SCORING = { compareLandlordWithBestPeasants, resolveTieWinner };
})(typeof window !== 'undefined' ? window : globalThis);
