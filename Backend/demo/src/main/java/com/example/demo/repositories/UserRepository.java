package com.example.demo.repositories;

import com.example.demo.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    //creer cette methode qui sera cruciale pour la connexion
    Optional<User> findByEmail(String email);

    // VERIFIER SI UN EMAIL EXISTE DEJA (POUR L'INSCRIPTION)
    Boolean existsByEmail(String email);

    //Trouver tout les utilisateurs par role (lister tout les professeurs par exemple)
    List<User> findByRole(String role);

    // chercher un utilisateur par son nom ou prenom
    List<User> findFirstNmaeContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName,String LastName);

    Long countByRole(String role);

    Long countByCreatedAfter(java.time.LocalDateTime date); //savoir combien des utilisateurs qui ont ete cree par jours
}
