package com.smartcampus.backend.security;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.user.AppUser;
import com.smartcampus.backend.user.AppUserRepository;
import com.smartcampus.backend.user.Role;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final AppUserRepository appUserRepository;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final Set<String> adminEmails;
    private final Set<String> technicianEmails;

    public CustomOAuth2UserService(
        AppUserRepository appUserRepository,
        @Value("${app.admin-emails:}") String adminEmailsRaw,
        @Value("${app.technician-emails:}") String technicianEmailsRaw
    ) {
        this.appUserRepository = appUserRepository;
        this.adminEmails = Arrays.stream(adminEmailsRaw.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .collect(Collectors.toSet());
            
        this.technicianEmails = Arrays.stream(technicianEmailsRaw.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .collect(Collectors.toSet());
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // The role will be set dynamically below
        AppUser user = appUserRepository.findByEmail(email).orElseGet(AppUser::new);
        user.setEmail(email);
        user.setName(name);
        user.setProvider(provider);
        
        // Determine role
        Role role = Role.USER;
        if (adminEmails.contains(email)) {
            role = Role.ADMIN;
        } else if (technicianEmails.contains(email)) {
            role = Role.TECHNICIAN;
        }

        // Only set default roles if the user has no roles, OR force role if they are in the admin/tech lists
        if (user.getRoles() == null || user.getRoles().isEmpty() || adminEmails.contains(email) || technicianEmails.contains(email)) {
            user.setRoles(Set.of(role));
        }
        appUserRepository.save(user);

        return new AppPrincipal(oauth2User, user.getRoles());
    }
}
