package tn.vermeg.gestionuser.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionuser.entities.Admin;
@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {
    Admin findByUserName(String userName); }