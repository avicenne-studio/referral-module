import { Test, type TestingModule } from "@nestjs/testing";

import { BANNED_WORDS } from "./banned-words";
import { CHARACTERS, MIN_LENGTH } from "./constants";
import { ReferralService } from "./referral.service";

describe("ReferralService", () => {
  let referralService: ReferralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        {
          provide: "REFERRAL_KEY",
          useValue: "test-project-name",
        },
      ],
    }).compile();

    referralService = module.get<ReferralService>(ReferralService);
  });

  describe("encode", () => {
    it("should encode a decimal number to the correct code", () => {
      const length = 4;
      const decimal = 12345;
      const result = referralService.encode(length, decimal);

      expect(result).toHaveLength(length);
      expect(result).toBeDefined();
    });
  });

  describe("decode", () => {
    it("should decode a code back to its original decimal and length", () => {
      const code = referralService.encode(4, 12345);
      const [length, decimal] = referralService.decode(code);

      expect(length).toBe(4);
      expect(decimal).toBe(12345);
    });
  });

  describe("getGCD", () => {
    it("should return the greatest common divisor of two numbers", () => {
      expect(referralService.getGCD(48, 18)).toBe(6);
      expect(referralService.getGCD(101, 103)).toBe(1);
    });
  });

  describe("getGenerator", () => {
    it("should return a valid generator for a given length", () => {
      const length = 4;
      const generator = referralService.getGenerator(length);

      const groupOrder = CHARACTERS.length ** length;
      expect(referralService.getGCD(generator, groupOrder)).toBe(1);
    });
  });

  describe("isBanned", () => {
    it("should return true for a code containing a banned word", () => {
      const [bannedCode] = BANNED_WORDS;
      expect(referralService.isBanned(bannedCode)).toBe(true);
    });

    it("should return false for a code not containing any banned word", () => {
      const validCode = "abcd";
      expect(referralService.isBanned(validCode)).toBe(false);
    });
  });

  describe("getNextReferralCode", () => {
    it("should return the first code when no code is provided", () => {
      const result = referralService.getNextReferralCode();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(MIN_LENGTH);
    });

    it("should return the next code when a valid code is provided", () => {
      const initialCode = referralService.encode(
        MIN_LENGTH,
        referralService["initialOffset"],
      ); // Using initialOffset derived from the project key

      const nextCode = referralService.getNextReferralCode(initialCode);

      expect(nextCode).not.toEqual(initialCode);
    });

    it("should skip codes containing banned words", () => {
      const mockIsBanned = jest
        .spyOn(referralService, "isBanned")
        .mockImplementationOnce(() => true)
        .mockImplementationOnce(() => false);

      const result = referralService.getNextReferralCode();

      expect(mockIsBanned).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();

      mockIsBanned.mockRestore();
    });

    it("should return different referral codes across projects", async () => {
      const firstCodeProject1 = referralService.getNextReferralCode();

      const secondModule: TestingModule = await Test.createTestingModule({
        providers: [
          ReferralService,
          {
            provide: "REFERRAL_KEY",
            useValue: "test-project-name-2",
          },
        ],
      }).compile();

      const secondReferralService =
        secondModule.get<ReferralService>(ReferralService);
      const firstCodeProject2 = secondReferralService.getNextReferralCode();

      expect(firstCodeProject1).toBeDefined();
      expect(firstCodeProject2).toBeDefined();
      expect(firstCodeProject1).not.toEqual(firstCodeProject2); // Ensure codes are different across projects
    });
  });
});
