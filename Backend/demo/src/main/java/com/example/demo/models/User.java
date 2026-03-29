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
    @Enumerated(EnumType.STRING) //indespensable pour stocker le nom en texte dans mysql
    @Column(nullable = false)
    private Role role = Role.ROLE_STUDENT;// ROLE_STUDENT OU ROLE_PROFESSOR

}
