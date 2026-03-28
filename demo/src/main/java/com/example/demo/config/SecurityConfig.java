package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Indispensable pour permettre a  Postman/Angular a envoyer des données (POST/PUT)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // "Permit All" = Autoriser tout le monde sans mot de passe
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable())); // Utile si tu utilises la console H2

        return http.build();
    }

}
