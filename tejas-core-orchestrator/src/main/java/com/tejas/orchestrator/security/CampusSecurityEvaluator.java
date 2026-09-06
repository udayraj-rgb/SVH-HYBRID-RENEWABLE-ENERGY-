package com.tejas.orchestrator.security;

import com.tejas.orchestrator.entity.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("campusSecurity")
public class CampusSecurityEvaluator {

    /**
     * Evaluates whether the currently authenticated principal is authorized to access data for the requested campus.
     * - ROLE_GOVT: Unrestricted access across all districts and campuses in Rajasthan.
     * - ROLE_OPERATOR & ROLE_STUDENT: Strictly isolated to their assigned campus.
     */
    public boolean canAccessCampus(Long requestedCampusId) {
        if (requestedCampusId == null) {
            return false;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return false;
        }

        // ROLE_GOVT has statewide unrestricted authority
        boolean isGovt = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Role.ROLE_GOVT.name()));
        if (isGovt) {
            return true;
        }

        // Scoped campus check for OPERATOR or STUDENT
        if (auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getCampusId() != null && principal.getCampusId().equals(requestedCampusId);
        }

        return false;
    }

    /**
     * Imperative assertion for service/controller layer data isolation.
     */
    public void validateCampusAccess(Long requestedCampusId) {
        if (!canAccessCampus(requestedCampusId)) {
            UserPrincipal principal = getCurrentUserPrincipal();
            String username = principal != null ? principal.getUsername() : "anonymous";
            Long assignedCampusId = principal != null ? principal.getCampusId() : null;

            throw new AccessDeniedException(String.format(
                    "Data isolation violation: User '%s' with assigned campus %s is unauthorized to access or modify data for campus %d.",
                    username, assignedCampusId != null ? assignedCampusId : "NONE", requestedCampusId
            ));
        }
    }

    public UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }
}
