export function test_heading(heading_name) {
  console.log(`\n*************\n${heading_name}`);
}

export function test_section(name) {
  console.log(`*** ${name}`);
}

export function assert_eq(a, b) {
  if (a !== b) {
    console.error("ASSERTION FAILED:");
    console.error(a);
    console.error(b);
    throw `${a} !== ${b}`;
  }
}

export function assert_nearly_eq(a, b, EPS) {
  assert_eq(Math.max(Math.abs(a - b) - EPS, 0), 0);
}

export function assert_true(b) {
  assert_eq(b, true);
}
