package com.example.library;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

/**
 * LIB-2, task T5. The UI runs on another origin
 * (localhost:4200), so the browser first asks this service
 * whether the call is allowed. Without this class the
 * browser blocks it, and the UI sees status 0.
 * Only what the story needs: read and add, from one origin.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST");
    }
}
