(function exposeSyncLogic(root) {
  function mergeRoundSnapshots(localRounds, remoteRounds, options = {}) {
    const normalize = options.normalize || (value => value);
    const isDeleted = options.isDeleted || (() => false);
    const limit = Math.max(1, Number(options.limit) || 200);
    const merged = new Map();

    (localRounds || [])
      .map(normalize)
      .filter(round => round?.id && !isDeleted(round))
      .forEach(round => merged.set(round.id, round));
    (remoteRounds || [])
      .map(normalize)
      .filter(round => round?.id && !isDeleted(round))
      .forEach(round => merged.set(round.id, round));

    return Array.from(merged.values())
      .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))
      .slice(0, limit);
  }

  function mergeRoundSummaries(localRounds, remoteSummaries, options = {}) {
    const normalize = options.normalize || (value => value);
    const getVersion = options.getVersion || (round => Number(round?.totals?.cloudVersion || 0));
    const byId = new Map((localRounds || []).map(round => [round?.id, round]));
    const mergedSummaries = (remoteSummaries || []).map(summary => {
      const existing = byId.get(summary?.id);
      if (!existing || existing.summaryOnly) return summary;
      const localVersion = Math.max(0, Number(getVersion(existing) || 0));
      const remoteVersion = Math.max(0, Number(getVersion(summary) || 0));
      const sameVersion = remoteVersion > 0
        ? localVersion >= remoteVersion
        : JSON.stringify(existing.totals || {}) === JSON.stringify(summary.totals || {});
      return sameVersion ? existing : summary;
    });
    return mergeRoundSnapshots(localRounds, mergedSummaries, { ...options, normalize });
  }

  function reconcileRoundSummaries(localRounds, remoteSummaries, options = {}) {
    const inScope = options.inScope || (() => true);
    const preserve = options.preserve || (() => false);
    const remoteIds = new Set((remoteSummaries || []).map(round => round?.id).filter(Boolean));
    const retainedLocal = (localRounds || []).filter(round => (
      !inScope(round) || remoteIds.has(round?.id) || preserve(round)
    ));
    return mergeRoundSummaries(retainedLocal, remoteSummaries, options);
  }

  root.SIMPLE_GOLF_SYNC = Object.freeze({ mergeRoundSnapshots, mergeRoundSummaries, reconcileRoundSummaries });
})(globalThis);
