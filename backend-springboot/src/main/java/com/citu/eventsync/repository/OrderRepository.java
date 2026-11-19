package com.citu.eventsync.repository;

import com.citu.eventsync.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserUserId(Integer userId);
    List<Order> findByEventEventId(Integer eventId);
}
