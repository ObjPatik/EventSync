package com.citu.eventsync.service;

import com.citu.eventsync.model.*;
import com.citu.eventsync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    // Matches Class Diagram: -orderRepository, -ticketRepository
    private final OrderRepository orderRepository;
    private final TicketTypeRepository ticketRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Matches Class Diagram: +generateTicketCode(): String
     * Generates a tamper-evident reference ticket code (e.g. ES-2026-X89J2K)
     */
    public String generateTicketCode() {
        StringBuilder sb = new StringBuilder("ES-2026-");
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Matches Class Diagram: +processPurchase(userId, ticketId, qty)
     * Enforces Row-Level Lock (SELECT ... FOR UPDATE) to satisfy FR-008 & Non-Functional Concurrency Requirement.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public PurchaseResponseDTO processPurchase(Integer userId, Integer ticketId, Integer qty) {
        if (qty <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }

        // 1. Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // 2. Fetch ticket with Row-Level Lock (Pessimistic Write Lock)
        TicketType ticket = ticketRepository.findByIdWithLock(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket type not found with ID: " + ticketId));

        // 3. Verify capacity
        if (ticket.getAvailableQty() < qty) {
            throw new RuntimeException("Sold Out: Requested " + qty + " tickets, but only " + ticket.getAvailableQty() + " are available.");
        }

        // 4. Deduct quantity atomically
        ticket.setAvailableQty(ticket.getAvailableQty() - qty);
        ticketRepository.save(ticket);

        // Deduct from event capacity as well
        Event event = ticket.getEvent();
        if (event.getCapacity() >= qty) {
            event.setCapacity(event.getCapacity() - qty);
            eventRepository.save(event);
        }

        // 5. Calculate total amount
        BigDecimal totalAmount = ticket.getPrice().multiply(BigDecimal.valueOf(qty));

        // 6. Create Order
        Order order = Order.builder()
                .user(user)
                .event(event)
                .totalAmount(totalAmount)
                .status("completed")
                .date(ZonedDateTime.now())
                .build();
        Order savedOrder = orderRepository.save(order);

        // 7. Generate unique ticket items with unique verification codes
        List<String> generatedCodes = new ArrayList<>();
        List<OrderItem> items = new ArrayList<>();

        for (int i = 0; i < qty; i++) {
            String code = generateTicketCode();
            generatedCodes.add(code);

            OrderItem item = OrderItem.builder()
                    .order(savedOrder)
                    .ticketType(ticket)
                    .uniqueCode(code)
                    .build();
            items.add(orderItemRepository.save(item));
        }

        // 8. Trigger Email Notification via SendGrid (FR-012)
        emailService.sendTicketReceipt(user.getEmail(), new EmailService.TicketDetailsDTO(
                savedOrder.getOrderId(),
                event.getTitle(),
                event.getDate(),
                event.getLocation(),
                ticket.getName(),
                qty,
                totalAmount,
                generatedCodes
        ));

        return new PurchaseResponseDTO(
                savedOrder.getOrderId(),
                event.getTitle(),
                ticket.getName(),
                qty,
                totalAmount,
                generatedCodes,
                "Purchase Successful"
        );
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class PurchaseResponseDTO {
        private Integer orderId;
        private String eventTitle;
        private String ticketTier;
        private Integer quantity;
        private BigDecimal totalAmount;
        private List<String> ticketCodes;
        private String message;
    }
}
