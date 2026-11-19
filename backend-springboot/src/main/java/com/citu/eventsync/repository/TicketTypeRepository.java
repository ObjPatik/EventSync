package com.citu.eventsync.repository;

import com.citu.eventsync.model.TicketType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Integer> {
    List<TicketType> findByEventEventId(Integer eventId);

    // Row-level locking to prevent race conditions during concurrent ticket purchases (FR-008)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TicketType t WHERE t.ticketId = :ticketId")
    Optional<TicketType> findByIdWithLock(@Param("ticketId") Integer ticketId);
}
