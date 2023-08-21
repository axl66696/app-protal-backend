export const subjectToConsumer = (subject: string) => {
    const subjectArray = subject.split('.');
    const lowerCamelCased = subjectArray.map((x, index) => {
        if (index === 0) return x;
        return x[0].toUpperCase() + x.slice(1);
    });

    return lowerCamelCased.join('');
};