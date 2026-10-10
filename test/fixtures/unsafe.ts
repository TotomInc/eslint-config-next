enum Direction {
  Up = "up",
  Down = "down",
}

export function describe(input: string | number, items: number[]) {
  if (typeof input === "string" && input) {
    return Direction.Up;
  }

  for (let index = 0; index < items.length; index++) {
    console.warn(items[index]);
  }

  return JSON.parse(String(input)) as Direction;
}

export const isPresent = (value: string) => !!value;
