package com.citu.eventsync.repository;

import com.citu.eventsync.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    Optional<OrderItem> findByUniqueCode(String uniqueCode);
    List<OrderItem> findByOrderOrderId(Integer orderId);
}
