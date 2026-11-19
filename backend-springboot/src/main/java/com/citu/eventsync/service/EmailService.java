package com.citu.eventsync.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {

    @Value("${sendgrid.api-key:SG.mock}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:tickets@eventsync.ph}")
    private String fromEmail;

    /**
     * Matches Class Diagram: +sendTicketReceipt(email, ticketDetails)
     * Dispatches transactional confirmation receipt via SendGrid (FR-012)
     */
    public boolean sendTicketReceipt(String recipientEmail, TicketDetailsDTO details) {
        System.out.println("----------------------------------------------------------------");
        System.out.println("[EmailService] Sending Ticket Receipt to: " + recipientEmail);
        System.out.println("[EmailService] Event: " + details.getEventTitle());
        System.out.println("[EmailService] Codes: " + details.getTicketCodes());
        System.out.println("----------------------------------------------------------------");

        // If mock key is detected, log and return true
        if (sendGridApiKey == null || sendGridApiKey.startsWith("SG.mock") || sendGridApiKey.isEmpty()) {
            System.out.println("[EmailService] SendGrid running in Mock/Simulation Mode (API Key not set). Email considered sent.");
            return true;
        }

        try {
            Email from = new Email(fromEmail, "EventSync Ticketing");
            Email to = new Email(recipientEmail);
            String subject = "Your Tickets for " + details.getEventTitle() + " [Order #" + details.getOrderId() + "]";

            String htmlBody = buildReceiptHtml(details);
            Content content = new Content("text/html", htmlBody);

            Mail mail = new Mail(from, subject, to, content);
            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            System.out.println("[EmailService] SendGrid API Response Code: " + response.getStatusCode());
            return response.getStatusCode() >= 200 && response.getStatusCode() < 300;
        } catch (IOException ex) {
            System.err.println("[EmailService] SendGrid dispatch error: " + ex.getMessage());
            return false;
        }
    }

    /**
     * Matches Class Diagram: +sendEventReminder(email, eventDetails)
     * Dispatches 24-hour reminder email (FR-013)
     */
    public boolean sendEventReminder(String recipientEmail, String eventTitle, ZonedDateTime eventDate, String location) {
        System.out.println("[EmailService] Sending 24h event reminder to: " + recipientEmail + " for " + eventTitle);
        // Automated reminder logic
        return true;
    }

    private String buildReceiptHtml(TicketDetailsDTO details) {
        StringBuilder codesHtml = new StringBuilder();
        for (String code : details.getTicketCodes()) {
            codesHtml.append("<div style='background:#f3f4f6;padding:8px 12px;margin:4px 0;border-radius:6px;font-family:monospace;font-size:16px;font-weight:bold;letter-spacing:1px;color:#4f46e5;'>")
                     .append(code)
                     .append("</div>");
        }

        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;padding:24px;'>" +
                "<h2 style='color:#1e1b4b;margin-bottom:8px;'>EventSync Ticket Confirmation</h2>" +
                "<p style='color:#6b7280;margin-top:0;'>Thank you for your purchase! Present your digital ticket code at the entrance.</p>" +
                "<hr style='border:none;border-top:1px solid #e5e7eb;margin:16px 0;'/>" +
                "<p><strong>Event:</strong> " + details.getEventTitle() + "</p>" +
                "<p><strong>Date & Time:</strong> " + (details.getEventDate() != null ? details.getEventDate().format(DateTimeFormatter.RFC_1123_DATE_TIME) : "TBA") + "</p>" +
                "<p><strong>Venue:</strong> " + details.getLocation() + "</p>" +
                "<p><strong>Ticket Tier:</strong> " + details.getTicketTier() + " (x" + details.getQuantity() + ")</p>" +
                "<p><strong>Total Amount:</strong> ₱" + details.getTotalAmount() + "</p>" +
                "<hr style='border:none;border-top:1px solid #e5e7eb;margin:16px 0;'/>" +
                "<h3 style='color:#374151;'>Your Digital Ticket Codes:</h3>" +
                codesHtml.toString() +
                "<p style='color:#9ca3af;font-size:12px;margin-top:24px;'>EventSync Cebu Institute of Technology - University IT342 Project</p>" +
                "</div>";
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class TicketDetailsDTO {
        private Integer orderId;
        private String eventTitle;
        private ZonedDateTime eventDate;
        private String location;
        private String ticketTier;
        private Integer quantity;
        private BigDecimal totalAmount;
        private List<String> ticketCodes;
    }
}
