package com.citu.eventsync.controller;

import com.citu.eventsync.model.Event;
import com.citu.eventsync.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;

    /**
     * FR-006: Display published events on public discovery feed
     */
    @GetMapping
    public ResponseEntity<List<Event>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.getPublishedEvents());
    }

    /**
     * Get event details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Integer id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    /**
     * FR-004 & FR-005: Create and publish event with ticket tiers
     */
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody EventService.EventCreateDTO dto) {
        return ResponseEntity.ok(eventService.createEvent(dto));
    }
}
