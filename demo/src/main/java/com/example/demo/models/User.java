package com.example.demo.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true,nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private  String lastName;

    // on utilise une enumeration ou un string pour le role
    @Column(nullable = false)
    private String role;// ROLE_STUDENT OU ROLE_PROFESSOR

}
