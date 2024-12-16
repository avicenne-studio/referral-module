import { Inject, Injectable } from "@nestjs/common";
import { createHash } from "crypto";

import { BANNED_WORDS } from "./banned-words";
import { CHARACTERS, MIN_LENGTH } from "./constants";

@Injectable()
export class ReferralService {
  private readonly initialOffset: number;

  constructor(@Inject("REFERRAL_KEY") private readonly key: string) {
    this.initialOffset = this.generateInitialOffset();
  }

  public encode(length: number, decimal: number) {
    let code = "";
    for (let i = 0; i < length; ++i) {
      code += CHARACTERS[decimal % CHARACTERS.length];
      decimal = Math.floor(decimal / CHARACTERS.length);
    }

    return code;
  }

  public decode(code: string): [number, number] {
    let decimal = 0;
    for (let i = code.length - 1; i >= 0; --i) {
      decimal *= CHARACTERS.length;
      decimal += CHARACTERS.indexOf(code.charAt(i));
    }

    return [code.length, decimal];
  }

  public getGCD(a: number, b: number) {
    if (b > a) [a, b] = [b, a];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      if (b === 0) return a;
      a %= b;

      if (a === 0) return b;
      b %= a;
    }
  }

  public getGenerator(length: number): number {
    const groupOrder = CHARACTERS.length ** length;

    let a = this.initialOffset,
      b = a + 1;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      if (this.getGCD(a, groupOrder) === 1) return a;
      if (this.getGCD(b, groupOrder) === 1) return b;
      --a;
      ++b;
    }
  }

  public isBanned(code: string) {
    return BANNED_WORDS.some((word) => code.includes(word));
  }

  public getNextReferralCode(code?: string): string {
    let generator = this.getGenerator(code?.length ?? MIN_LENGTH);

    if (code !== undefined) {
      let [length, decimal] = this.decode(code);
      decimal += generator;
      decimal %= CHARACTERS.length ** length;

      // If we are back to the initial offset (first code of that length),
      // Then we have generated all codes of that length, so we start with the next length.
      if (decimal === this.initialOffset) {
        generator = this.getGenerator(++length);
      }

      code = this.encode(length, decimal);
    } else {
      code = this.encode(MIN_LENGTH, this.initialOffset);
    }

    // Skip this code if it contains a banned word
    if (this.isBanned(code)) return this.getNextReferralCode(code);

    return code;
  }

  private generateInitialOffset() {
    const hash = createHash("sha256").update(this.key).digest("hex");
    return parseInt(hash.substring(0, 8), 16);
  }
}
