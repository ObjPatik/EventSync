package com.citu.eventsync.controller;

import com.citu.eventsync.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    /**
     * Matches SRS Sequence Diagram:
     * Attendee -> ReactJS -> POST /api/tickets/purchase -> Spring Boot
     * Locks row in PostgreSQL, checks capacity, inserts Order & OrderItem, triggers SendGrid, returns 200 OK.
     */
    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseTickets(@RequestBody PurchaseRequest request) {
        try {
            OrderService.PurchaseResponseDTO response = orderService.processPurchase(
                    request.getUserId(),
                    request.getTicketId(),
                    request.getQuantity()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            // Returns 400 Bad Request with Sold Out error as specified in sequence diagram [qty == 0]
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "error", ex.getMessage()
            ));
        }
    }

    @lombok.Data
    public static class PurchaseRequest {
        private Integer userId;
        private Integer ticketId;
        private Integer quantity;
    }
}
