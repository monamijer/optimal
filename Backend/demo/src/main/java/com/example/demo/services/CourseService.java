package com.example.demo.services;

import com.example.demo.dtos.CourseDTO;
import com.example.demo.mappers.CourseMapper;
import com.example.demo.models.Course;
import com.example.demo.repositories.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class CourseService {
    private final CourseRepository courseRepository;
    private final  CourseMapper courseMapper;

    //LECTURE : Recuperer tout pour Angular
    public List<CourseDTO> getAll(){
        return courseRepository.findAll()
                .stream()
                .map(CourseMapper::toDTO)// on transforme chaque ligne
                .collect(Collectors.toList());
    }
    // À ajouter dans CourseService.java
    public CourseDTO getCourseById(Long id) {
        // 1. On cherche le cours dans la base de données via le repository
        // Optional permet de gérer le cas où l'ID n'existe pas
        return courseRepository.findById(id)
                .map(CourseMapper::toDTO) // 2. Si trouvé, on le transforme en DTO
                .orElseThrow(() -> new RuntimeException("Cours introuvable avec l'ID : " + id)); // 3. Sinon, erreur
    }

    // Ecriture: Enregistrer un cours venant d'Angular
    public CourseDTO save(CourseDTO dto){
        // on transforme le dto en entity pour mysql
        Course course = CourseMapper.toEntity(dto);

        //On enregistre dans la base des donnees
        Course savedCourse = courseRepository.save(course);

        // On renvoie le resultat en dto (avec son nouvel ID)
        return  CourseMapper.toDTO(savedCourse);
    }

    // Dans CourseService.java
    public void deleteCourse(Long id) {
        // 1. Vérifier si le cours existe avant d'essayer de le supprimer
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : Cours introuvable");
        }

        // 2. Supprimer le cours (Si tu as mis 'cascade' dans le Model,
        // les sections disparaîtront aussi automatiquement)
        courseRepository.deleteById(id);
    }
}
