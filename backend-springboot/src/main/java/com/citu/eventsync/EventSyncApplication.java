package com.citu.eventsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EventSyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventSyncApplication.class, args);
        System.out.println("==================================================");
        System.out.println("  EventSync Backend Server is Running on :8080");
        System.out.println("  Connected to Supabase PostgreSQL Database");
        System.out.println("==================================================");
    }
}
