export const Utils = {
    shuffleArray<T>(array:Array<T>): Array<T> {
        const newArray = [...array]; // Create a copy to avoid mutating the original
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = newArray[i];
            newArray[i] = newArray[j];
            newArray[j] = temp;
          }
        return newArray;
    }
}
