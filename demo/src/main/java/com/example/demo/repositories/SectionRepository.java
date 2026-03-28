package com.example.demo.repositories;

import com.example.demo.models.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository  extends JpaRepository<Section, Long> {
    List<Section> findByCourseIdOrderByOrderIndexAsc(Long courseId);
}
