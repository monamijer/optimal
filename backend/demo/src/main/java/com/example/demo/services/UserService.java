package com.example.demo.services;

import com.example.demo.dtos.UserDTO;
import com.example.demo.mappers.UserMapper;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class UserService {
    private final UserRepository userRepository;

    //recuperer tous les utilisateurs
    public List<UserDTO> fincAllUsers(){
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
}
