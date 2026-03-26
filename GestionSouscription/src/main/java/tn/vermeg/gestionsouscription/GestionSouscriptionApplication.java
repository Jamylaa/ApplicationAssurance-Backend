package tn.vermeg.gestionsouscription;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class GestionSouscriptionApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionSouscriptionApplication.class, args);
    }

}
