export const Utils = {
    shuffleArray<T>(array:Array<T>) :Array<T>{
  // Make a copy to avoid mutating the original array
  const shuffled = [...array];

  // For each element from the end to the beginning
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random element from the unshuffled portion
    const j = Math.floor(Math.random() * (i + 1));

    // Swap the current element with the randomly selected one
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
}
