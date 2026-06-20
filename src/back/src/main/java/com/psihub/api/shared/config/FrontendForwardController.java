package com.psihub.api.shared.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendForwardController {

    @GetMapping({
            "/",
            "/auth/**",
            "/paciente/**",
            "/psicologo/**",
            "/admin/**",
            "/forbidden"
    })
    public String forwardFrontendRoutes() {
        return "forward:/index.html";
    }
}
