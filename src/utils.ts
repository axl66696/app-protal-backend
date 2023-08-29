export const compareSubject = (subject: string, value: string) => {
  const subjectArray = subject.split('.');
  const valueArray = value.split('.');

  const hasGreaterSign = subjectArray.includes('>');

  if (hasGreaterSign && subjectArray.indexOf('>') !== subjectArray.length - 1) {
    throw new Error('Wrong Subject!!');
  }

  if (
    (!hasGreaterSign && subjectArray.length !== valueArray.length) ||
    (hasGreaterSign && subjectArray.length > valueArray.length)
  ) {
    return false;
  }

  const result = subjectArray
    .filter((s) => s !== '>')
    .reduce((prev, currentTag, index) => {
      return (
        prev &&
        !!valueArray[index] &&
        (currentTag === '*' || currentTag === valueArray[index])
      );
    }, true);

  return result;
};
