import { Module } from "@nestjs/common";
import { Pool } from "pg";

export const PG_POOL = "PG_POOL";

@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () =>
        new Pool({
          connectionString:
            process.env.DATABASE_URL ??
            "postgres://leap:leap@127.0.0.1:5433/leap_w6",
        }),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
