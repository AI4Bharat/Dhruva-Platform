const getWordCount = (sentence: string) => {
  const trimmedSentence = sentence.trim();
  const wordArray = trimmedSentence.split(" ");
  return wordArray.length;
};

export { getWordCount };
