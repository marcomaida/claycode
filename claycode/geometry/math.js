Math.lerp = function (a, b, t) {
	return a + (b - a) * t;
};

Math.sum = function (array) {
	return array.reduce((a, b) => a + b, 0)
}

Math.normalise = function (array) {
	const total = Math.sum(array);
	return array.map(v => v / total);
}