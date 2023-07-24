export function assert_eq(a, b) {
    if (a !== b) {
        throw `${a} !== ${b}`
    }

    console.log(".")
}