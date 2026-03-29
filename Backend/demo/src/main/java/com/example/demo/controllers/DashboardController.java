package com.example.demo.controllers;

import com.example.demo.dtos.DashboardStatsDTO;
import com.example.demo.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats(){
        return dashboardService.getAdminStats();
    }
}
