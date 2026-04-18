package com.smartcampus.backend.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final CustomOAuth2UserService customOAuth2UserService;
    private final String frontendUrl;

    public SecurityConfig(
        CustomOAuth2UserService customOAuth2UserService,
        @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error", "/login/**", "/oauth2/**", "/api/test-db").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(authenticationSuccessHandler())
                .failureHandler((request, response, exception) -> {
                    System.err.println("OAUTH2 LOGIN FAILED: " + exception.getMessage());
                    exception.printStackTrace();
                    response.sendRedirect("/login?error");
                })
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) ->
                    response.setStatus(HttpServletResponse.SC_NO_CONTENT))
            )
            .build();
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(
                HttpServletRequest request,
                HttpServletResponse response,
                org.springframework.security.core.Authentication authentication
            ) throws IOException, ServletException {
                response.sendRedirect(frontendUrl);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin(frontendUrl);
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
