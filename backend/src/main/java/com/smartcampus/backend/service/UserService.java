package com.smartcampus.backend.service;

import com.smartcampus.backend.user.AppUser;
import com.smartcampus.backend.user.AppUserRepository;
import com.smartcampus.backend.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;

    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }

    public AppUser updateUserRoles(String userId, Set<Role> roles) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setRoles(roles);
        return appUserRepository.save(user);
    }
}
