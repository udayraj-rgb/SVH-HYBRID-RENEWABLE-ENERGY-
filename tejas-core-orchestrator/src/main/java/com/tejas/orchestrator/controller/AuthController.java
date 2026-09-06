package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.dto.AuthRequest;
import com.tejas.orchestrator.dto.AuthResponse;
import com.tejas.orchestrator.security.JwtTokenProvider;
import com.tejas.orchestrator.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    /**
     * POST /api/v1/auth/login
     * Authenticates user credentials and issues a signed stateless JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        AuthResponse response = new AuthResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getFullName(),
                userPrincipal.getEmail(),
                userPrincipal.getRole(),
                userPrincipal.getCampusId(),
                userPrincipal.getCampusName()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/auth/me
     * Returns details of currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Map<String, Object> me = new LinkedHashMap<>();
        me.put("id", principal.getId());
        me.put("username", principal.getUsername());
        me.put("fullName", principal.getFullName());
        me.put("email", principal.getEmail());
        me.put("role", principal.getRole());
        me.put("campusId", principal.getCampusId());
        me.put("campusName", principal.getCampusName());
        me.put("isGovt", principal.isGovt());
        return ResponseEntity.ok(me);
    }
}
