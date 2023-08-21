export const subjectToConsumer = (subject: string) => {
  const subjectArray = subject.split('.');
  return subjectArray.join('-');
};
