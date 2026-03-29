package com.example.demo.dtos;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

@Data
public class SectionDTO {
    private Long id;
    private String title;
    private String content; //  c'est ici que voyagera le MarkDown
    private int orderIndex; // pour trier (1,2,,3 ,..)
    private Long courseId; // juste l'ID POUR SAVOIR A QUEL COURS CA APPARTIENT
}
