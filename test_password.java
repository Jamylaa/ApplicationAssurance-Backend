import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class test_password {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // The hash from your database
        String storedHash = "$2a$10$bZZwkFF0.uqTMQyCFsQSZux274L8Nfe.C/ozYzIpBuVbHjThR1vrO";
        
        // The password you're trying to login with
        String passwordToTest = "Fourat221";
        
        // Test if they match
        boolean matches = encoder.matches(passwordToTest, storedHash);
        
        System.out.println("Password: " + passwordToTest);
        System.out.println("Hash: " + storedHash);
        System.out.println("Matches: " + matches);
        
        // Let's also test what this hash actually represents
        System.out.println("\nTesting some common passwords:");
        String[] testPasswords = {"Fourat221", "Fourat", "password", "admin", "123456"};
        
        for (String pwd : testPasswords) {
            System.out.println(pwd + " -> " + encoder.matches(pwd, storedHash));
        }
    }
}
