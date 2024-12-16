import { Module, type DynamicModule } from "@nestjs/common";

import { ReferralService } from "./referral.service";

@Module({})
/* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
export class ReferralModule {
  static register(key: string): DynamicModule {
    return {
      module: ReferralModule,
      providers: [
        ReferralService,
        {
          provide: "REFERRAL_KEY",
          useValue: key,
        },
      ],
      exports: [ReferralService],
    };
  }
}
