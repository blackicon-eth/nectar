import { Bee } from "@ethersphere/bee-js";

export function createBee(beeUrl: string): Bee {
  return new Bee(beeUrl);
}
