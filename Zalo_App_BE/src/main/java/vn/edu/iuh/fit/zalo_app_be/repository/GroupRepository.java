/*
 * @ (#) GroupRepository.java       1.0     4/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.edu.iuh.fit.zalo_app_be.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.zalo_app_be.model.Group;

import java.util.List;

/*
 * @author: Luong Tan Dat
 * @date: 4/30/2025
 */

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByMemberIdsContaining(String userId);
}
