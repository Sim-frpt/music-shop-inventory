function shortenDescription(desc) {
  let desiredTextLength = 150;

  // Only shorten if character exists
  if (desc.charAt(desiredTextLength)) {

    // Make sure we don't cut in the middle of a word
    while(desc.charAt(desiredTextLength) !== ' ') {
      desiredTextLength++;
    }

    return desc.substring(0, desiredTextLength);
  }

  return desc;
}

module.exports = shortenDescription;
