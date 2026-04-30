package com.smartcampus.backend.controller;

import com.smartcampus.backend.service.UserService;
import com.smartcampus.backend.user.AppUser;
import com.smartcampus.backend.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<AppUser> updateUserRoles(@PathVariable String id, @RequestBody Set<Role> roles) {
        return ResponseEntity.ok(userService.updateUserRoles(id, roles));
    }
}
