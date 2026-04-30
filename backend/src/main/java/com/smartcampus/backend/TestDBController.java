package com.smartcampus.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

@RestController
public class TestDBController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MongoClient mongoClient;

    @GetMapping("/api/test-db")
    public String testDb() {
        try {
            MongoDatabase db = mongoClient.getDatabase("Campus_Management");
            Document commandResult = db.runCommand(new Document("ping", 1));
            long count = mongoTemplate.getCollectionNames().size();
            return "SUCCESS! Connected to DB. Ping Result: " + commandResult.toJson() + "\nNumber of collections: " + count;
        } catch (Exception e) {
            e.printStackTrace();
            return "FAILED TO CONNECT: " + e.getMessage();
        }
    }
}
