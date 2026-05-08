package tn.vermeg.gestionuser.services.impl;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.vermeg.gestionuser.entities.User;
import tn.vermeg.gestionuser.repositories.UserRepository;
import tn.vermeg.gestionuser.services.MailService;
import tn.vermeg.gestionuser.services.UserService;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService, UserDetailsService {

        private final UserRepository userRepository;
        private final MailService mailService;

        public UserServiceImpl(UserRepository userRepository, MailService mailService) {
            this.userRepository = userRepository;
            this.mailService = mailService;
        }

        //  CRUD

        @Override
        public List<User> getAllUsers() {
            return userRepository.findAll();
        }

        @Override
        public Optional<User> getUserById(String idUser) {
            return userRepository.findById(idUser);
        }

        // CREATE
        @Override
        public User createUser(User user) {

            User savedUser = userRepository.save(user);

            //  Envoi email
            try {
                mailService.sendCredentials(
                        savedUser.getEmail(),
                        savedUser.getUsername(),
                        user.getPassword() //
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi mail (create): " + e.getMessage());
            }

            return savedUser;
        }

        //  UPDATE
        @Override
        public User updateUser(String idUser, User user) {

            User existingUser = userRepository.findById(idUser)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            existingUser.setUsername(user.getUsername());
            existingUser.setEmail(user.getEmail());
            existingUser.setPhone(user.getPhone());
            existingUser.setDepartement(user.getDepartement());

            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existingUser.setPassword(user.getPassword());
            }

            User updatedUser = userRepository.save(existingUser);

//            //  Email update
//            try {
//                mailService.sendEmail(
//                        updatedUser.getEmail(),
//                        "Mise à jour de votre compte",
//                        "Bonjour,\n\nVotre compte a été mis à jour avec succès.\n\nCordialement."
//                );
//            } catch (Exception e) {
//                System.err.println("Erreur envoi mail (update): " + e.getMessage());
//            }

            return updatedUser;
        }

        //  DELETE
        @Override
        public void deleteUser(String idUser) {

            Optional<User> userOpt = userRepository.findById(idUser);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                userRepository.deleteById(idUser);

                // 📧 Email suppression
                try {
                    mailService.sendEmail(
                            user.getEmail(),
                            "Suppression de votre compte",
                            "Bonjour,\n\nVotre compte a été supprimé.\n\nCordialement."
                    );
                } catch (Exception e) {
                    System.err.println("Erreur envoi mail (delete): " + e.getMessage());
                }
            }
        }

        @Override
        public Optional<User> getUserByEmail(String email) {
            return userRepository.findByEmail(email);
        }

        @Override
        public Optional<User> getUserByUsername(String username) {
            return userRepository.findByUsername(username);
        }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPassword())
                    .build();
        }
    }


//    // SECURITY (JWT)
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//
//        User user = userRepository.findByUsername(username)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//
//        return org.springframework.security.core.userdetails.User.builder()
//                .username(user.getUsername())
//                .password(user.getPassword())
//                .build();
//    }

    // ================= CRUD =================
//    @Override
//    public List<User> getAllUsers() {
//        return userRepository.findAll();
//    }
//
//    @Override
//    public Optional<User> getUserById(String idUser) {
//        return userRepository.findById(idUser);
//    }
//
//    @Override
//    public User createUser(User user) {
//        return userRepository.save(user);
//    }
//
//    @Override
//    public User updateUser(String idUser, User user) {
//
//        User existingUser = userRepository.findById(idUser)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        existingUser.setUsername(user.getUsername());
//        existingUser.setEmail(user.getEmail());
//        existingUser.setPhone(user.getPhone());
//        existingUser.setDepartement(user.getDepartement());
//
//         if (user.getPassword() != null && !user.getPassword().isEmpty()) {
//            existingUser.setPassword(user.getPassword());
//        }
//
//        return userRepository.save(existingUser);
//    }
//
//    @Override
//    public void deleteUser(String idUser) {
//        userRepository.deleteById(idUser);
//    }
//
//     @Override
//    public Optional<User> getUserByEmail(String email) {
//        return userRepository.findByEmail(email);
//    }
//
//    @Override
//    public Optional<User> getUserByUsername(String username) {
//        return userRepository.findByUsername(username);
//    }


//  SECURITY
//        @Override
//        public UserDetails findByUsername(String username) throws UsernameNotFoundException {
//
//            User user = userRepository.findByUsername(username)
//                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//
//            return org.springframework.security.core.userdetails.User.builder()
//                    .username(user.getUsername())
//                    .password(user.getPassword())
//                    .build();
//        }