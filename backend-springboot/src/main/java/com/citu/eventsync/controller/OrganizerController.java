package com.citu.eventsync.controller;

import com.citu.eventsync.model.Event;
import com.citu.eventsync.model.Order;
import com.citu.eventsync.model.OrderItem;
import com.citu.eventsync.repository.EventRepository;
import com.citu.eventsync.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/organizer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrganizerController {

    private final EventRepository eventRepository;
    private final OrderRepository orderRepository;

    /**
     * FR-010: Real-time ticket sales and revenue dashboard
     */
    @GetMapping("/dashboard/{orgId}")
    public ResponseEntity<?> getDashboardStats(@PathVariable Integer orgId) {
        List<Event> events = eventRepository.findByOrganizerUserId(orgId);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalTicketsSold = 0;
        List<Map<String, Object>> eventSummaries = new ArrayList<>();

        for (Event event : events) {
            List<Order> orders = orderRepository.findByEventEventId(event.getEventId());
            BigDecimal eventRev = orders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalRevenue = totalRevenue.add(eventRev);

            int eventSold = 0;
            for (Order o : orders) {
                if (o.getOrderItems() != null) {
                    eventSold += o.getOrderItems().size();
                }
            }
            totalTicketsSold += eventSold;

            eventSummaries.add(Map.of(
                    "eventId", event.getEventId(),
                    "title", event.getTitle(),
                    "date", event.getDate(),
                    "location", event.getLocation(),
                    "capacity", event.getCapacity(),
                    "ticketsSold", eventSold,
                    "revenue", eventRev
            ));
        }

        return ResponseEntity.ok(Map.of(
                "orgId", orgId,
                "totalEvents", events.size(),
                "totalRevenue", totalRevenue,
                "totalTicketsSold", totalTicketsSold,
                "events", eventSummaries
        ));
    }

    /**
     * FR-011: View and export list of registered attendees in CSV format
     */
    @GetMapping("/events/{eventId}/attendees/export-csv")
    public ResponseEntity<byte[]> exportAttendeesCsv(@PathVariable Integer eventId) {
        List<Order> orders = orderRepository.findByEventEventId(eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        StringBuilder csv = new StringBuilder();
        csv.append("Order ID,Event Title,Attendee Name,Attendee Email,Ticket Tier,Unique Code,Purchase Date,Amount (PHP)\n");

        for (Order order : orders) {
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    csv.append(order.getOrderId()).append(",")
                       .append("\"").append(event.getTitle().replace("\"", "\"\"")).append("\",")
                       .append("\"").append(order.getUser().getName().replace("\"", "\"\"")).append("\",")
                       .append(order.getUser().getEmail()).append(",")
                       .append("\"").append(item.getTicketType() != null ? item.getTicketType().getName() : "General").append("\",")
                       .append(item.getUniqueCode()).append(",")
                       .append(order.getDate()).append(",")
                       .append(order.getTotalAmount()).append("\n");
                }
            }
        }

        byte[] csvBytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendees_event_" + eventId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
