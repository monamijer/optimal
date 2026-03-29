package com.example.demo.services;

import com.example.demo.dtos.UserDTO;
import com.example.demo.mappers.UserMapper;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.core.RepositoryCreationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper; // N'oublie pas d'injecter le mapper aussi !

    //recuperer tous les utilisateurs
    public List<UserDTO> findAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    //trouver un utilisateur par son email
    public UserDTO findByEmail(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserMapper.toDTO(user);
    }

    //creer un nouvel utilisateur (utile pour l'inscription)
    @Transactional
    public UserDTO createUser(User user){

        // // On vérifie si l'email existe déjà pour éviter les doublons dans MySQL
        if (userRepository.findByEmail(user.getEmail()).isPresent()){
            throw  new RuntimeException("The email provided is already exist");
        }
        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);

    }

    //supprimer un utilisateur
    @Transactional
    public void deleteUser(Long id){
        if (! userRepository.existsById(id)){
            throw  new RuntimeException("Can't delete user");
        }
        userRepository.deleteById(id);
    }
}
