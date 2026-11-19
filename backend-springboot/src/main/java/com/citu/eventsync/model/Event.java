package com.citu.eventsync.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Integer eventId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "org_id", nullable = false)
    private User organizer;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private ZonedDateTime date;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Integer capacity;

    private String category;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(nullable = false)
    private String status; // 'draft', 'published', 'cancelled'

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TicketType> ticketTypes;
}
