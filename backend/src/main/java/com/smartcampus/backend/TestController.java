package com.smartcampus.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Value("${spring.data.mongodb.uri:NOT_FOUND}")
    private String mongoUri;

    @Value("${spring.security.oauth2.client.registration.google.client-id:NOT_FOUND}")
    private String clientId;

    @GetMapping("/test-props")
    public String getProps() {
        return "Mongo URI: " + mongoUri + "\nClient ID: " + clientId;
    }
}
