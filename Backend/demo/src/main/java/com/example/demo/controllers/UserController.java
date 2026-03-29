package com.example.demo.controllers;

import com.example.demo.dtos.SectionDTO;
import com.example.demo.dtos.UserDTO;
import com.example.demo.models.User;
import com.example.demo.services.SectionService;
import com.example.demo.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.PublicKey;
import java.util.List;

@RestController // dis au navigateur que lesd= donnes qu'il va recevoir sont des donnees brut
@RequestMapping("/api/sections") // la route
@RequiredArgsConstructor // genere un constructeurr automatique
@CrossOrigin(origins = "http://localhost:4200") // permet la communication entre Angular et Spring (mmunication entre 2 serveurs )

public class UserController {

    private final UserService userService;


    @GetMapping
    public List<UserDTO> getAll(){
        return userService.findAllUsers();
    }

    @GetMapping("/email/{email}")
    public UserDTO getByEmail(@PathVariable String email){
        return userService.findByEmail(email);
    }

    // 3. Créer un utilisateur (Inscription)
    @PostMapping("/register")
    public UserDTO register(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PostMapping("/{id}")
    public void delete(@PathVariable Long id){
        userService.deleteUser(id);
    }



}