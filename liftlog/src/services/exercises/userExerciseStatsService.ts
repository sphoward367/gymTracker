const FAVOURITES_KEY = 'liftlog_favourite_exercises';

export const userExerciseStatsService = {
  getFavourites(): Set<string> {
    try {
      const raw = localStorage.getItem(FAVOURITES_KEY);
      if (!raw) return new Set();
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((id): id is string => typeof id === 'string'));
    } catch {
      return new Set();
    }
  },

  /** Toggles favourite status. Returns `true` if the exercise is now a favourite. */
  toggleFavourite(exerciseId: string): boolean {
    const favourites = this.getFavourites();
    const isNowFavourite = !favourites.has(exerciseId);
    if (isNowFavourite) {
      favourites.add(exerciseId);
    } else {
      favourites.delete(exerciseId);
    }
    try {
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify([...favourites]));
    } catch {
      // fail silently
    }
    return isNowFavourite;
  },

  isFavourite(exerciseId: string): boolean {
    return this.getFavourites().has(exerciseId);
  },
};
