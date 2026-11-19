package com.citu.eventsync.service;

import com.citu.eventsync.model.Event;
import com.citu.eventsync.model.TicketType;
import com.citu.eventsync.model.User;
import com.citu.eventsync.repository.EventRepository;
import com.citu.eventsync.repository.TicketTypeRepository;
import com.citu.eventsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    // Matches Class Diagram: -eventRepository
    private final EventRepository eventRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;

    // Matches Class Diagram: +getPublishedEvents()
    public List<Event> getPublishedEvents() {
        return eventRepository.findByStatus("published");
    }

    public Event getEventById(Integer eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));
    }

    public List<Event> getEventsByOrganizer(Integer orgId) {
        return eventRepository.findByOrganizerUserId(orgId);
    }

    // Matches Class Diagram: +createEvent(eventDetails)
    @Transactional
    public Event createEvent(EventCreateDTO dto) {
        User organizer = userRepository.findById(dto.getOrgId())
                .orElseThrow(() -> new RuntimeException("Organizer not found with ID: " + dto.getOrgId()));

        Event event = Event.builder()
                .organizer(organizer)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .date(dto.getDate() != null ? dto.getDate() : ZonedDateTime.now().plusDays(14))
                .location(dto.getLocation())
                .capacity(dto.getCapacity())
                .category(dto.getCategory() != null ? dto.getCategory() : "Community")
                .bannerUrl(dto.getBannerUrl() != null ? dto.getBannerUrl() : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800")
                .status("published")
                .build();

        Event savedEvent = eventRepository.save(event);

        // If ticket tiers are provided, save them
        if (dto.getTicketTiers() != null && !dto.getTicketTiers().isEmpty()) {
            for (TicketTierDTO tier : dto.getTicketTiers()) {
                TicketType ticketType = TicketType.builder()
                        .event(savedEvent)
                        .name(tier.getName())
                        .price(tier.getPrice())
                        .availableQty(tier.getQuantity())
                        .initialQty(tier.getQuantity())
                        .build();
                ticketTypeRepository.save(ticketType);
            }
        } else {
            // Default General Admission
            TicketType defaultTicket = TicketType.builder()
                    .event(savedEvent)
                    .name("General Admission")
                    .price(BigDecimal.ZERO)
                    .availableQty(dto.getCapacity())
                    .initialQty(dto.getCapacity())
                    .build();
            ticketTypeRepository.save(defaultTicket);
        }

        return savedEvent;
    }

    // DTOs for event creation
    @lombok.Data
    public static class EventCreateDTO {
        private Integer orgId;
        private String title;
        private String description;
        private ZonedDateTime date;
        private String location;
        private Integer capacity;
        private String category;
        private String bannerUrl;
        private List<TicketTierDTO> ticketTiers;
    }

    @lombok.Data
    public static class TicketTierDTO {
        private String name;
        private BigDecimal price;
        private Integer quantity;
    }
}
