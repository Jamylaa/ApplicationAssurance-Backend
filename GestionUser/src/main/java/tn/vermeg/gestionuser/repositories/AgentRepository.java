package tn.vermeg.gestionuser.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionuser.entities.Agent;

@Repository
public interface AgentRepository extends MongoRepository<Agent, String> {
    Agent findByUserName(String userName);
}
