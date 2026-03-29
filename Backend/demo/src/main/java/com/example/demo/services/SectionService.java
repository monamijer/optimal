package com.example.demo.services;

import com.example.demo.dtos.SectionDTO;
import com.example.demo.mappers.SectionMapper;
import com.example.demo.models.Course;
import com.example.demo.models.Section;
import com.example.demo.repositories.CourseRepository;
import com.example.demo.repositories.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class SectionService {
    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final SectionMapper sectionMapper;


    // Pour récupérer les chapitres dans l'ordre pour Angular
    public List<SectionDTO> getSectionsByCourseId(Long courseId) {
        return sectionRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(SectionMapper::toDTO)
                .collect(Collectors.toList());
    }


    //creer une nouvelle section Markdown
    @Transactional
    public SectionDTO saveSection(SectionDTO dto){
        // on cherche le cours parent
        Course course = courseRepository
                .findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        //convertir le DTO en Entity
        Section section = SectionMapper.toEntity(dto);

        //on fait le lien physique
        section.setCourse(course);

        // on enregistre et on renvoie le DTO
        return SectionMapper.toDTO(sectionRepository.save(section));
    }

    //supprimer unse section
    @Transactional
    public void deleteSection(Long id){
        if (!sectionRepository.existsById(id)) {

            throw new RuntimeException("Section not found");
        }
        sectionRepository.deleteById(id);
    }


}
