package com.smartcampus.backend.auth;

import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.security.AppPrincipal;
import com.smartcampus.backend.user.Role;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> getCurrentUser(@AuthenticationPrincipal AppPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthUserResponse response = new AuthUserResponse(
            principal.getEmail(),
            principal.getDisplayName(),
            principal.getRoles()
        );
        return ResponseEntity.ok(response);
    }

    public record AuthUserResponse(String email, String name, Set<Role> roles) {
    }
}
