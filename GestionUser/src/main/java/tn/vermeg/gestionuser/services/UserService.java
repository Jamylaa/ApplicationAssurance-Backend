package tn.vermeg.gestionuser.services;

import tn.vermeg.gestionuser.entities.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    Optional<User> getUserById(String idUser);
    User createUser(User user);
    User updateUser(String idUser, User user);
    void deleteUser(String idUser);
    Optional<User> getUserByEmail(String email);
    Optional<User> getUserByUsername(String username);

   // boolean existsByEmail(String email);
    //boolean existsByUserName(String username);
}
