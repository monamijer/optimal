package com.example.demo.repositories;

import com.example.demo.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course,Long> {
    // Les méthodes findAll(), save(), delete() sont déjà incluses !
}
