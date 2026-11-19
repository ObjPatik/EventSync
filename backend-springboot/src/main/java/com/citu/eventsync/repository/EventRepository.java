package com.citu.eventsync.repository;

import com.citu.eventsync.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByStatus(String status);
    List<Event> findByOrganizerUserId(Integer orgId);
}
