package tn.vermeg.gestionuser.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionuser.entities.Client;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends MongoRepository<Client, String> {
    Client findByUserName(String userName);
    Optional<Client> findByEmail(String email);
    List<Client> findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
}
