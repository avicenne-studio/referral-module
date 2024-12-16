import { NestFactory } from "@nestjs/core";

import { ReferralModule } from "./referral.module";

async function bootstrap() {
  const app = await NestFactory.create(ReferralModule);
  await app.listen(3000);
}

void bootstrap();
