package com.smartcampus.backend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("Local environment debug helper; not part of CI test suite.")
@SpringBootTest(classes = BackendApplication.class)
class EnvTest {

    @Autowired
    private Environment env;

    @Test
    void printMongoUri() {
        System.out.println("==================================================");
        System.out.println("MONGO URI: " + env.getProperty("spring.data.mongodb.uri"));
        String clientId = env.getProperty("spring.security.oauth2.client.registration.google.client-id");
        if (clientId != null) {
            System.out.println("CLIENT ID: " + clientId);
        }
        System.out.println("==================================================");
    }
}
