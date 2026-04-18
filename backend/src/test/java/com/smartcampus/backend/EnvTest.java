package com.smartcampus.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

@SpringBootTest
class EnvTest {

    @Autowired
    private Environment env;

    @Test
    void printMongoUri() {
        System.out.println("==================================================");
        System.out.println("MONGO URI: " + env.getProperty("spring.data.mongodb.uri"));
        System.out.println("CLIENT ID: " + env.getProperty("spring.security.oauth2.client.registration.google.client-id"));
        System.out.println("==================================================");
    }
}
