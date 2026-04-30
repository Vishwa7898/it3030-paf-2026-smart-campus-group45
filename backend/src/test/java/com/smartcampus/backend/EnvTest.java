@SpringBootTest
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
