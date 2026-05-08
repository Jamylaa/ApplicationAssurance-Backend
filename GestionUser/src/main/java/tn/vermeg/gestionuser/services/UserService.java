package tn.vermeg.gestionuser.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import tn.vermeg.gestionuser.entities.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    //  SECURITY
  //  User findByUsername(String username) throws UsernameNotFoundException;

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
