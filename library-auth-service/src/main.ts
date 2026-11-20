import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import {
  DocumentBuilder,
  SwaggerModule,
} from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { USING_FALLBACK_SECRET } from "./jwt-secret";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // Only the Library UI (port 4200) may call us from a browser.
  app.enableCors({ origin: "http://localhost:4200" });

  const config = new DocumentBuilder()
    .setTitle("Library Auth Service")
    .setDescription("Register, log in, get a signed token")
    .setVersion("1.0")
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, doc);

  if (USING_FALLBACK_SECRET) {
    console.warn("[auth] WARNING: JWT_SECRET is not set.");
    console.warn("[auth] Using the secret in the code.");
  }
  await app.listen(process.env.PORT ?? 3000);
  console.log("Auth service on http://localhost:3000");
  console.log("OpenAPI docs at http://localhost:3000/api");
}

bootstrap();
