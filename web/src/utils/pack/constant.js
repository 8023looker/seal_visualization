export function constant_zero() {
    return 0;
}

export default function (x) {
    return function () {
        return x;
    };
}
