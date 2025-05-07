/*
 * @ (#) CallRepository.java       1.0     5/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.repository;
/*
 * @author: Luong Tan Dat
 * @date: 5/6/2025
 */

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.zalo_app_be.model.Call;

import java.util.List;

@Repository
public interface CallRepository extends MongoRepository<Call, String> {

    List<Call> findByCallerIdOrParticipantIdsContaining(String callerId, String participantId);

    List<Call> findByGroupId(String groupId);
}
