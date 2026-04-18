package com.smartcampus.backend.security;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.smartcampus.backend.user.Role;

public class AppPrincipal extends DefaultOAuth2User {
    private final String email;
    private final String name;
    private final Set<Role> roles;

    public AppPrincipal(OAuth2User oauth2User, Set<Role> roles) {
        super(authoritiesFromRoles(roles), oauth2User.getAttributes(), "email");
        this.email = oauth2User.getAttribute("email");
        this.name = oauth2User.getAttribute("name");
        this.roles = roles;
    }

    private static Collection<? extends GrantedAuthority> authoritiesFromRoles(Set<Role> roles) {
        return roles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
            .collect(Collectors.toSet());
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return name;
    }

    public Set<Role> getRoles() {
        return roles;
    }
}
