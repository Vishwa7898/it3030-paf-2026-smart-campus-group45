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

    public CustomOAuth2UserService(
        AppUserRepository appUserRepository,
        @Value("${app.admin-emails:}") String adminEmailsRaw
    ) {
        this.appUserRepository = appUserRepository;
        this.adminEmails = Arrays.stream(adminEmailsRaw.split(","))
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
        
        // Only set default roles if the user has no roles, OR force ADMIN if they are in the admin-emails list
        if (user.getRoles() == null || user.getRoles().isEmpty() || adminEmails.contains(email)) {
            Role role = adminEmails.contains(email) ? Role.ADMIN : Role.USER;
            user.setRoles(Set.of(role));
        }
        appUserRepository.save(user);

        return new AppPrincipal(oauth2User, user.getRoles());
    }
}
