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

export function assert_array_eq(array1, array2) {
  let result = false;

  if (array1.length === array2.length) {
    result = array1.every((element, index) => {
      if (element === array2[index]) {
        return true;
      }

      return false;
    });
  }

  if (!result) {
    console.error("ASSERTION FAILED:");
    console.error(array1);
    console.error(array2);
    throw `${array1} !== ${array2}`;
  }
}

export function assert_nearly_eq(a, b, EPS) {
  assert_eq(Math.max(Math.abs(a - b) - EPS, 0), 0);
}

export function assert_true(b) {
  assert_eq(b, true);
}
