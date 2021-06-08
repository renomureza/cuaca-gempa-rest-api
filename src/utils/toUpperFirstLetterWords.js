const upperFirstLetter = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const toUpperFirstLetterWords = (word, separator = '-', replacer = '') => {
  if (!word || typeof word !== 'string') {
    throw new Error('Word must be string and not empty');
  }

  // 1 word
  if (!word.includes(separator)) {
    return upperFirstLetter(word);
  }

  // DKI Jakarta & DIYogyakarta => DKIJakarta & DIYogyakarta
  if (word.includes('jakarta') || word.includes('yogyakarta')) {
    const [word1, word2] = word.split(separator);
    return word1.toUpperCase() + upperFirstLetter(word2);
  }

  // > 1 word
  return word.split(separator).map(upperFirstLetter).join(replacer);
};

module.exports = toUpperFirstLetterWords;
