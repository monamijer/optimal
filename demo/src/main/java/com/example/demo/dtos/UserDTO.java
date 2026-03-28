package com.example.demo.dtos;

import lombok.Data;

@Data
public class UserDTO {
    private  Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    // pas de password pour plus de securite
}
